const request = require("request");
const mongo = require("./mongoFunctions.js");

/**
 * @class
 * @classdesc Class offering downloading and parsing of substitutions for ascEduPage based websites.
 */
class EduPageSubstitutions {
	/**
	 * @param {string} url Url to EduPage website root.
	 * @param {string[]} [classList] Array of class names.
	 */
	constructor(url, classList) {
		/** URL pointing to `/substitution/` - substitutions page for users. */
		this.pageUrl = url.endsWith("/") ? url + "substitution/" : url + "/substitution/";
		/** URL pointing to `/server/viewer.js?__func=getSubstViewerDayDataHtml` - script returning substitutions as HTML */
		this.viewerURL = this.pageUrl + "server/viewer.js?__func=getSubstViewerDayDataHtml";
		/** Class list used for splitting classes and group name. It may be `undefined` */
		this.classList = classList;
	}

	/**
	 * Makes a request to EduPage website, saves cookies and gsh parameter.
	 * @returns {Promise<CookieAndGsh>} Promise resolving to an object conteining cookie jar and gsh parameter
	 */
	getCookieAndGsh() {
		return new Promise((resolve, reject) => {
			// Create cookie jar
			let cookieJar = request.jar();
			// Use this jar as default
			let requestWithCookies = request.defaults({ jar: cookieJar });
			// Make standard request to `/substitution/`, get cookie and page containing gsh
			requestWithCookies(this.pageUrl, (err, res, body) => {
				if (err) {
					return reject(`Cookie and gsh request failed!\n${err}`);
				}
				if (!res) {
					return reject("Cookie and gsh request failed! No response received");
				}
				if (res.statusCode !== 200) {
					return reject("Cookie and gsh request failed! Status code is not 200");
				}
				if (!body) {
					return reject("Cookie and gsh request failed! No body received");
				}
				/** Regular expression used for extracing gsh (`ASC.gsechash`); uses es2018 named groups */
				let gshRegex = /ASC.gsechash="(?<gsh>\w*)";/;
				// Execute RegEx and read gsh
				let gsh = gshRegex.exec(body).groups.gsh;
				// Check if gsh exists
				if (!(gsh && gsh.length > 0)) {
					reject("gsh not found in response body!");
				}
				resolve({ gsh: gsh, cookieJar: cookieJar });
			});
		});
	}

	/**
	 * Makes a request to school page and downloads substitutions for students (by class, **DEFAULT**) or teacher (by teacher name) for a given day.
	 * @param {string} date Date for which the substitutions should be downloaded in `yyyy-mm-dd` format.
	 * @param {CookieAndGsh} cookieAndGsh Cookie and gsh used to make a request
	 * @param {boolean} [teachers=false] Whether the substitutions should be in "teachers" format or not. It's `false` by default.
	 * @returns {Promise<string>} Promise which resolves to a string representation of **JSON** containing substitutions in **HTML** format.
	 */
	downloadSubstitutions(date, cookieAndGsh, teachers = false) {
		return new Promise((resolve, reject) => {
			// Get cookie jar and gsh parameter
			let { gsh, cookieJar } = cookieAndGsh;
			// Use received cookie jar for request
			let requestWithCookies = request.defaults({ jar: cookieJar });
			requestWithCookies({
				// Set required headers ("Referer" is not required)
				headers: {
					"Content-type": "application/json; charset=utf-8",
					"Referer": this.pageUrl
				},
				uri: this.viewerURL,
				// Body must be a string, JSON.stringify for some reason doesn't work
				body: `{"__args":[null,{"date":"${date}","mode":"${teachers ? "teachers" : "classes"}"}],"__gsh":"${gsh}"}`,
				method: "POST",
				gzip: true // Allow request compression
			}, (err, res, body) => {
				if (err) {
					console.error(`${new Date().toLocaleString()}: Error while downloading substitutions:`);
					console.error(err);
					return reject(err);
				}
				if (!res) {
					return reject(`${new Date().toLocaleString()}: Error while downloading substitutions! No response received`);
				}
				if (res.statusCode !== 200) {
					return reject(`${new Date().toLocaleString()}: Error while downloading substitutions! Status code is not 200`);
				}
				if (!body) {
					return reject(`${new Date().toLocaleString()}: Error while downloading substitutions! No body received`);
				}
				// If everything is ok resolve with response
				resolve(body);
			});
		});
	}

	/**
	 * Parses a single HTML row/substitution in sutdent format
	 * @param {string} singleSubstitutionHTML HTML with a single substitution (lesson number and information string)
	 * @param {string} className Name of class which is affected by this substitution
	 * @returns {SingleSubstitution | null} Single substitution object
	 */
	substitutionRowStudentsParser(singleSubstitutionHTML, className) {
		/** Selects lesson number (or name) in the first (and only) capture group. If the lesson is cancelled the number is in `()` */
		const lessonRegExp = /<div class="period">[\s\r\n]*<span class="print-font-resizable">\(?(\w*)\)?<\/span>/;
		/** Selects content of span with substitution data in the first (and only) capture group */
		const substitutionStringRegExp = /<div class="info">[\s\r\n]*<span class="print-font-resizable">([\w\W]*)<\/span>/;
		/** Matches known cancelled lesson pattern and saves group name (optional) and lesson subject. It saves also a "note" if such exists */
		const cancelledLessonRegExp = /^(?:(?<groupName>[\w\W]*): )?(?<subject>[\w\W]*) - Anulowano(?:, (?<note>[\w\W]*))?$/;
		/**
		 * Despite its name it **doesn't** work with everyhing - there's a separate RegExp for *cancelled* lessons.
		 *
		 * Works with:
		 *
		 * - Classroom change
		 * - Teacher change
		 * - Teacher and classroom change
		 * - Subject and teacher change
		 * - Subject, teacher and classroom change
		 *
		 * Group is optional (and saved if exists) in all of these cases.
		 *
		 * (***BETA***) Note/comment *SHOULD* also be captured (if exists).
		 *
		 * The result (of `.exec()`) contains following groups:
		 * - `groupName` - optional, contains group name
		 * - `subject` - (old) subject of the lesson if there is a change of subject
		 * - `newSubject` - new subject of the lesson if there is a change of subject
		 * - `subject2` - subject of the lesson if the subject doesn't change
		 * - `teacher` - teacher, only if there's a techer change
		 * - `newTeacher` - substituting teacher (if any)
		 * - `classroom` - classroom number/name if students have to change the classroom
		 * - `newClassroom` - new classroom number - where the students should go
		 * - `note` - additional note/comment provided by school.
		 * **WARNING!** It's not a completely tested functionality (for sure it doesn't break anything) as not enough data was available.
		 * That's why I call it a ***BETA*** feature.
		 */
		const allInOneReExp = /^(?:(?<groupName>[\w\W]*): )?(?:\((?<subject>[\w\W]*)\) ➔ (?<newSubject>[\w\W]*)|(?<subject2>[\w\W]*)) - (?:Zastępstwa: \((?<teacher>[\w\W]*?)\) ➔ (?<newTeacher>[\w\W]*?))?(?:, )?(?:Zmień salę lekcyjną: \((?<classroom>[\w\W]*)\) ➔ (?<newClassroom>[\w\W]*?))?(?:, (?<note>[\w\W]*))?$/;

		/** Lesson number */
		let lesson = lessonRegExp.exec(singleSubstitutionHTML)[1];
		// If it contains " - " then the substitution contains only information that the class is absent for a few lessons, but no other data
		if (lesson.includes(" - ")) return null;
		/** String containing substitution data (group, teacher, subject, classroom) */
		let contentString = substitutionStringRegExp.exec(singleSubstitutionHTML)[1];
		/** @type {SingleSubstitution} Single substitution object that will be added to `substitutionsArr` */
		let singleSubstitutionObject;
		// If the lesson is cancelled
		if (cancelledLessonRegExp.test(contentString)) {
			let { groupName, subject, note } = cancelledLessonRegExp.exec(contentString).groups;
			singleSubstitutionObject = {
				cancelled: [true],
				note: [note || ""],
				periods: [lesson],
				subjects: [subject],
				teachers: [""], // in this version it is not possible to determine a teacher for cancelled lesson
				classes: [className],
				groupnames: [groupName || ""], // Group name may not exist
				classrooms: [""], // in this version it is not possible to determine a classroom where cancelled lesson would otherwise take place
				rawHTML: singleSubstitutionHTML
			};
		} else if (allInOneReExp.test(contentString)) { // If the substitution matches the "all in one" format
			let { groupName, subject, newSubject, subject2, teacher, newTeacher, classroom, newClassroom, note } = allInOneReExp.exec(contentString).groups;
			singleSubstitutionObject = {
				cancelled: [false],
				note: [note || ""], // I don't know how do the notes look in this version - not enough data (see `allInOne` description)
				periods: [lesson],
				subjects: [subject || subject2],
				teachers: [teacher || ""],
				classes: [className],
				groupnames: [groupName || ""],
				classrooms: [classroom || ""],
				rawHTML: singleSubstitutionHTML
			};
			// If there are any changes
			if (newSubject || newTeacher || newClassroom) {
				// Create changes key
				singleSubstitutionObject.changes = {};
				if (newSubject) singleSubstitutionObject.changes.subjects = [newSubject];
				if (newTeacher) singleSubstitutionObject.changes.teachers = [newTeacher];
				if (newClassroom) singleSubstitutionObject.changes.classrooms = [newClassroom];
			}
		} else {
			console.error(`${new Date().toLocaleString()}: The substitution doesn't match any known format. Logging data:\n`, singleSubstitutionHTML);
		}
		return singleSubstitutionObject;
	}

	/**
	 * Tries to separate classes and group from one string.
	 * I assume that there is only one group. This assumption may be wrong, but I haven't seen other format yet.
	 * @param {string} classesAndGroupsString String containing list of classes and group.
	 * @returns {ClassesAndGroup} Object containing classes and group.
	 */
	classesAndGroup(classesAndGroupsString) {
		/** String to which a one (last) class and 0/1 group name will be saved */
		let oneClassAndGroup = "";
		/** @type {string[]} Result array of classes (strings) */
		let classes = [];
		// Classes are separated using ", "
		if (classesAndGroupsString.includes(", ")) {
			// Divide using ", " as a separator
			let divided = classesAndGroupsString.split(", ");
			// Remove last element of the array and save it as `oneClassAndGroup`
			oneClassAndGroup = divided.pop();
			// Save class list to `classes`
			classes = divided;
		} else {
			// If there is no ", " then there is only one class
			oneClassAndGroup = classesAndGroupsString;
		}
		// If we have a class list
		if (this.classList) {
			for (const className of this.classList) {
				// If a class name matches exactly a string, then there's no group
				if (oneClassAndGroup === className) return { classes: [className], group: "" };
				// Assume that there is no class which would start with full name of another class. Then I can divide it into a class name and group name
				if (oneClassAndGroup.startsWith(className)) {
					// Group is divided with a single space from class, so `+1`.
					let group = oneClassAndGroup.substr(className.length + 1);
					// Add the last class to array
					classes.push(className);
					return { classes: classes, group: group };
				}
			}
			// If there is a match in known class list this won't be called
			console.error(`${new Date().toLocaleString()}: oneClassAndGroup string does not contain any of known clases: ${oneClassAndGroup}`);
		}
		// Assume that there is no space in class name
		if ((oneClassAndGroup.match(" ") || []).length > 0) {
			// Divide by space
			let divided = oneClassAndGroup.split(" ");
			// Assume that class name is (only) the first element of array
			let [oneClass] = divided;
			// Get group
			let group = oneClassAndGroup.substr(oneClass.length + 1);
			classes.push(oneClass);
			return { classes: classes, group: group };
		} else {
			// If there is no space it must be a class name
			classes.push(oneClassAndGroup);
			return { classes: classes, group: "" };
		}
	}

	/**
	 * Parses a single HTML row/substitution in teachers format
	 * @param {string} singleSubstitutionHTML HTML with a single substitution (lesson number and information string)
	 * @param {string} teacherName Name of teacher who is affected by this substitution
	 * @returns {SingleSubstitution | null} Single substitution object
	 */
	substitutionRowTeachersParser(singleSubstitutionHTML, teacherName) {
		/** Selects lesson number (or name) in the first (and only) capture group. If the lesson is cancelled the number is in `()` */
		const lessonRegExp = /<div class="period">[\s\r\n]*<span class="print-font-resizable">\(?(\w*)\)?<\/span>/;
		/** Selects content of span with substitution data in the first (and only) capture group */
		const substitutionStringRegExp = /<div class="info">[\s\r\n]*<span class="print-font-resizable">([\w\W]*)<\/span>/;
		/** Matches known cancelled lesson pattern and saves classes with group name and lesson subject. It saves also a "note" if such exists */
		const cancelledLessonRegExp = /^(?<classesAndGroups>[\w\W]*): (?<subject>[\w\W]*) - Anulowano(?:, (?<note>[\w\W]*))?$/;
		/**
		 * Despite its name it **doesn't** work with everyhing - there's a separate RegExp for *cancelled* lessons.
		 *
		 * ***WARNING:*** This may not work, as I didn't have enough data to test it.
		 *
		 * Works with:
		 *
		 * - Classroom change
		 * - Teacher change
		 * - Teacher and classroom change
		 * - Subject and teacher change
		 * - Subject, teacher and classroom change
		 *
		 * Classes and groups are saved as one element - there is no clear separator between a class and group as they are separated with space and they can contain spaces.
		 *
		 * The result (of `.exec()`) contains following groups:
		 * - `classesAndGroups` - contains classes and groups that take part in a lesson
		 * - `subject` - (old) subject of the lesson if there is a change of subject
		 * - `newSubject` - new subject of the lesson if there is a change of subject
		 * - `subject2` - subject of the lesson if the subject doesn't change
		 * - `prevTeacher` - teacher who is absent and substitutied
		 * - `classroom` - classroom number/name if students have to change the classroom
		 * - `newClassroom` - new classroom number - where the students should go
		 * - `classroom2` - classroom number/name if there is no classroom change
		 * - `note` - additional note/comment provided by school.
		 */
		const allInOneReExp = /^(?<classesAndGroups>[\w\W]*): (?:\((?<subject>[\w\W]*)\) ➔ (?<newSubject>[\w\W]*)|(?<subject2>[\w\W]*)) - (?:Substitution for: (?<prevTeacher>[\w\W]*?))?(?:, )?(?:Zmień salę lekcyjną: \((?<classroom>[\w\W]*)\) ➔ (?<newClassroom>[\w\W]*?))?(?:Sala szkolna: (?<classroom2>[\w\W]*))?(?:, (?<note>[\w\W]*))?$/;

		/** Lesson number */
		let lesson = lessonRegExp.exec(singleSubstitutionHTML)[1];
		// If the lesson number contains slash it means that it's not a lesson, but "supervision". If it contains " - " then the substitution contains only information that the teacher is absent for a few lessons, but no other data
		if (lesson.includes("/") || lesson.includes(" - ")) return null;
		/** String containing substitution data (group, teacher, subject, classroom) */
		let contentString = substitutionStringRegExp.exec(singleSubstitutionHTML)[1];
		/** @type {SingleSubstitution} Single substitution object that will be added to `substitutionsArr` */
		let singleSubstitutionObject;
		// If the lesson is cancelled
		if (cancelledLessonRegExp.test(contentString)) {
			let { classesAndGroups, subject, note } = cancelledLessonRegExp.exec(contentString).groups;
			let { classes, group } = this.classesAndGroup(classesAndGroups);
			singleSubstitutionObject = {
				cancelled: [true],
				note: [note || ""],
				periods: [lesson],
				subjects: [subject],
				teachers: [teacherName],
				classes: classes,
				groupnames: [group], // Group name may not exist, but the function `classesAndGroup()` should return an empty string then
				classrooms: [""], // in this version it is not possible to determine a classroom where cancelled lesson would otherwise take place
				rawTHTML: singleSubstitutionHTML
			};
		} else if (allInOneReExp.test(contentString)) { // If the substitution matches the "all in one" format
			let { classesAndGroups, subject, newSubject, subject2, prevTeacher, classroom, newClassroom, classroom2, note } = allInOneReExp.exec(contentString).groups;
			let { classes, group } = this.classesAndGroup(classesAndGroups);
			singleSubstitutionObject = {
				cancelled: [false],
				note: [note || ""], // I don't know how do the notes look in this version - not enough data (see `allInOne` description)
				periods: [lesson],
				subjects: [subject || subject2],
				teachers: [prevTeacher || teacherName], // There is no prevTeacher if only classroom changes - the "valid" teacher is then `teacherName`
				classes: classes,
				groupnames: [group || ""],
				classrooms: [classroom || classroom2 || ""],
				rawTHTML: singleSubstitutionHTML
			};
			// If there are any changes
			if (newSubject || prevTeacher || newClassroom) {
				// Create changes key
				singleSubstitutionObject.changes = {};
				if (newSubject) singleSubstitutionObject.changes.subjects = [newSubject];
				if (prevTeacher) singleSubstitutionObject.changes.teachers = [teacherName]; // If there is a `prevTeacher` there must also be a new teacher
				if (newClassroom) singleSubstitutionObject.changes.classrooms = [newClassroom];
			}
		} else {
			console.error(`${new Date().toLocaleString()}: The substitution doesn't match any known format. Logging data:\n`, singleSubstitutionHTML);
		}
		return singleSubstitutionObject;
	}

	/**
	 * Parses substitution data (by class or teacher - depending on `forTeachers`) received from EduPage.
	 *
	 * If `rawData` is not a valid JSON or it doesn't contain `r` key this function will throw.
	 * It can also throw if the regular expressions won't match substitutions
	 * @param {string} rawData JSON in string representaton that contains raw HTML with substitutions as HTML.
	 * @param {boolean} [forTeachers=false] Are the substitutions in "teachers" format? Default: `false`.
	 * @returns {ParserResponse} Object containing date and substitutions (or `"no substitutions"` string)
	 */
	parse(rawData, forTeachers = false) {
		/** @type {string} String containing substitutions as raw HTML */
		let rawHTML = JSON.parse(rawData).r;
		/** Date extracted from HTML using RegEx: @see https://regexr.com/481g1 */
		let date = /<div data-date="(\d{4}-\d{2}-\d{2})">/.exec(rawHTML)[1];
		/** Is `true` if thre are no substitutions for that day */
		let noSubstitutions = /<div>W tym dniu nie ma żadnych zastępstw\.<\/div>/.test(rawHTML);
		if (noSubstitutions) {
			return { substitution: "no substitutions", date: date };
		}
		/** Allows extracting substitutions for one class (or teacher): @see https://regexr.com/481gp */
		const subsForClassRegExp = /(?<=<div class="section print-nobreak">)[\w\W]*?<\/div>[\s\r\n]*<\/div>(?![\s\r\n]*<div class="row">)/g;
		/** @type {RegExpExecArray} Substitutions for one class (or teacher) result array */
		var substitutionsByClassArr;
		/** Selects class/teacher name: @see https://regexr.com/481il */
		const classNameRegExp = /<div class="header"><span class="print-font-resizable">([\w\W]*?)<\/span><\/div>/;
		/** Selects single substitution (global): @see https://regexr.com/481ja */
		const singleSubstitutionData = /(?<=<div class="row">)[\w\W]*?<\/div>(?=[\s\r\n]*<\/div>)/g;
		/** Matches if a class or teacher is absent during all (of their) lessons */
		const allDayCancelledRegExp = /<div class="period">[\s\r\n]*<span class="print-font-resizable">Cały dzień<\/span>/;
		/** @type {SingleSubstitution[]} Array of substitutions */
		var substitutionsArr = [];
		while ((substitutionsByClassArr = subsForClassRegExp.exec(rawHTML)) !== null) {
			/** HTML containing all substitutions for one class/teacher */
			let substitutionsByClass = substitutionsByClassArr[0];
			/** String containing a class or teacher name */
			let className = classNameRegExp.exec(substitutionsByClass)[1];
			/** @type {RegExpExecArray} Single substitution data as HTML in RegExp result array */
			var singleClassSubDataArr;
			while ((singleClassSubDataArr = singleSubstitutionData.exec(substitutionsByClass)) !== null) {
				/** HTML containing single substitution */
				let singleSubData = singleClassSubDataArr[0];
				// If a class or teacher is absent whole day just skip their data. Maybe their substitutions will be obtained from data in other format.
				if (allDayCancelledRegExp.test(singleSubData)) continue;
				/** Single substitution object for class/taecher by appropriate parser */
				let singleSubstitutionObject = forTeachers ? this.substitutionRowTeachersParser(singleSubData, className) : this.substitutionRowStudentsParser(singleSubData, className);
				// If the substitution is undefined (doesn't match any known format) it should be ignored
				if (!singleSubstitutionObject) continue; // Go to the next element in loop
				/** Substitution isn't a duplicate and can be pushed to array*/
				let canPush = true;
				// There should be no duplicates in substituttions for teachers
				if (!forTeachers) {
					for (let i = 0; i < substitutionsArr.length; ++i) {
						let singleSub = substitutionsArr[i];
						/* If you want a good and detailed explanation read the coments in the lines below. For shorter one read this:
						If not canncelled, on the same lesson, with the same subject and with the same teacher (name not empty) or in the same classroom (number/name not empty) and the note isn't different
						*/
						if (!singleSub.cancelled[0] && // Is NOT cancelled (in this case we have not enough data for other chcks to pass) AND
							singleSub.periods[0] === singleSubstitutionObject.periods[0] && // Takes place during the same lesson AND
							singleSub.subjects[0] === singleSubstitutionObject.subjects[0] && // The subject is the same AND
							((
								singleSub.teachers[0] !== "" && // The teacher name is given AND
								singleSub.teachers[0] == singleSubstitutionObject.teachers[0] // it is the same for both substitutions
							) || ( // OR
								singleSub.classrooms[0] !== "" && // The classroom is given AND
								singleSub.classrooms[0] == singleSubstitutionObject.teachers[0] // it's the same for both substtutions
							))
						) {
							// Add the class name to list of classes affected by the substitution
							substitutionsArr[i].classes.push(singleSubstitutionObject.classes[0]);
							// Don't include the substitution as it would be a duplicate now
							canPush = false;
							break; // One substitution cannot be duplicate of multiple non-duplicated substitutions, so there's no need to loop further
						}
					}
				}
				if (canPush) substitutionsArr.push(singleSubstitutionObject);
			}
		}
		if (!noSubstitutions && substitutionsArr.length === 0) {
			// It can happen eg. when it is only known that a teacher is absent, but there are no details about substitutions yet. I have no idea how to handle it better, so I'll only log the error (not throw) and return.
			console.error("No substitutions found in the following data: ", rawData);
			console.error("Changing substitution param to \"no substitutions\"");
			return { substitution: "no substitutions", date: date };
			//throw new Error("No substitutions found in parsed data, but there was no information that there should be no substitutions");
		}
		return { substitution: substitutionsArr, date: date };
	}

	/**
	 * Generates a list of classes that are affected by the substitutions
	 * @param {SingleSubstitution[] | string} substitution Array of substitutions or `"no substitutions"` string
	 * @returns {string[]} Array of strings (classes). May be empty.
	 */
	classesList(substitution) {
		if (substitution === "no substitutions") return [];
		if (typeof substitution !== "string") {
			// Use a set to avoid duplicates
			let classes = new Set();
			for (const sub of substitution) {
				for (const className of sub.classes) {
					classes.add(className);
				}
			}
			return Array.from(classes);
		} else {
			console.error(`${new Date().toLocaleString()}: Can't create the classes list - string other than "no substitutions" was received. Returning empty array`);
			return [];
		}
	}

	/**
	 * Generates a list of teachers that are affected by the substitutions
	 * @param {SingleSubstitution[] | string} substitution Array of substitutions or `"no substitutions"` string
	 * @returns {string[]} Array of strings (teachers). May be empty. Is sorted.
	 */
	teachersList(substitution) {
		if (substitution === "no substitutions") return [];
		if (typeof substitution !== "string") {
			// Use a set to aviod duplicates
			let teachers = new Set();
			for (const sub of substitution) {
				for (const teacherName of sub.teachers) {
					// Teacher name sometimes can be empty, but we don't want empty names on the list
					if (teacherName !== "") teachers.add(teacherName);
				}
				// If there are changes there may be also another teacher
				if (sub.changes && sub.changes.teachers) {
					for (const teacherName of sub.changes.teachers) {
						teachers.add(teacherName);
					}
				}
			}
			return Array.from(teachers).sort();
		} else {
			console.error(`${new Date().toLocaleString()}: Can't create the teachers list - string other than "no substitutions" was received. Returning empty array`);
			return [];
		}
	}

	/**
	 * Add teachers from substitutions for current day to database if they are not there yet.
	 * @param {string[]} teachersFromSub Array of teachers that appear in substitutions for a give day
	 */
	updateDBTeachersList(teachersFromSub) {
		// Get current list of teachers from database
		mongo.findById("all", "teachers", (e, obj) => {
			if (e) {
				console.error(`${new Date().toLocaleString()}: Can't update teachers list in db - an error occured when downloading the old one:\n${e}`);
			} else {
				/** @type {string[]} Teachers list received from database */
				let teachersFromDB = obj.teachers;
				// Create a Set from both arrays (remove duplicates)
				let allTeachersSet = new Set(teachersFromDB.concat(teachersFromSub));
				// Create array from Set and sort it
				let newTeachersArray = Array.from(allTeachersSet).sort();
				// If there is any content to be added
				if (newTeachersArray.length && newTeachersArray.length > teachersFromDB.length) {
					// Update the database entry
					mongo.modifyById("all", "teachers", { teachers: newTeachersArray }, () => {
						// Log the event
						console.log("Teachers array was updated (probably - saving data might have failed, but I can't check that). Full list below:");
						console.log(newTeachersArray);
					});
				}
			}
		});
	}

	/**
	 * Tries to merge substitutions for students and teachers into one array with no duplicates.
	 * It may return `"no substitutions"` if both substitutions for teachers and students are `"no substitutions"` strings
	 * @param {SingleSubstitution[] | string} studentsSubstitutions Array of substitutions for students
	 * @param {SingleSubstitution[] | string} teacherSubstitutions Array of substitutions for teachers
	 * @returns {SingleSubstitution[] | string} Array of merged substitutions or `"no substitutions"`
	 */
	mergeSubstitutions(studentsSubstitutions, teacherSubstitutions) {
		if (typeof studentsSubstitutions === "string") return teacherSubstitutions;
		if (typeof teacherSubstitutions === "string") return studentsSubstitutions;
		for (let i = 0; i < studentsSubstitutions.length; i++) {
			/** A shallow clone of `studentSubstitutions[i]`. It's just a single substitution for students. Modifying it will modify the original elemnt in array */
			let singleStudentSubstitution = studentsSubstitutions[i];
			for (let n = 0; n < teacherSubstitutions.length; n++) {
				/** Single teacher substitution */
				let singleTeacherSubstitution = teacherSubstitutions[n];
				// If on the same lesson and both are not cancelled. Cancelled lessons are saved in only one of these arrays, depending on who is absent.
				if (singleStudentSubstitution.periods[0] === singleTeacherSubstitution.periods[0] && singleStudentSubstitution.cancelled[0] === singleTeacherSubstitution.cancelled[0] && !singleStudentSubstitution.cancelled[0]) {
					// These two if's could be just a one if statement, but now it probably is more readable.
					// If the teacher is the same or the classroom is the same (there is no teacher in students substitutions if only classroom changes)
					if (singleStudentSubstitution.teachers[0] === singleTeacherSubstitution.teachers[0] || singleStudentSubstitution.classrooms[0] === singleTeacherSubstitution.classrooms[0]) {
						// Substitutions for teachers always contain classroom, so it can be added to students substitution
						if (singleStudentSubstitution.classrooms[0] === "") singleStudentSubstitution.classrooms = singleTeacherSubstitution.classrooms;
						// Substitutions for student may not include information about teacher, so taht will be added too
						if (singleStudentSubstitution.teachers[0] === "") singleStudentSubstitution.teachers = singleTeacherSubstitution.teachers;
						// If there is a note for teacher but not for students
						if (singleTeacherSubstitution.note[0] !== "" && singleStudentSubstitution.note[0] === "") {
							singleStudentSubstitution.note = singleTeacherSubstitution.note;
						} else if (singleTeacherSubstitution.note[0] !== singleStudentSubstitution.note[0] && singleTeacherSubstitution.note[0] !== "") {
							// If there are different notes for students and teachers and both of them exist
							singleStudentSubstitution.note[0] += `; ${singleTeacherSubstitution.note[0]}`;
						}
						// Add teacher HTML
						singleStudentSubstitution.rawTHTML = singleTeacherSubstitution.rawTHTML;
						// As the teacher substitution is now a duplicate it can be removed from the array
						teacherSubstitutions.splice(i, 1);
					}
				}
			}
		}
		// Append teacher substitutions that were left to the student substitutions array and return it
		studentsSubstitutions.concat(teacherSubstitutions);
		return studentsSubstitutions;
	}

	/**
	 * Tries to assign substitution type to substitutions.
	 *
	 * Only `"przesunięcie do sali"` (change classroom) is supported - I'd have to compare the substitution with a timetable in order to determine more information.
	 * @param {SingleSubstitution[]} substitutionsArr Array of substitutions
	 * @returns {SingleSubstitution[]} Array of substitutions with assigned types
	 */
	assignSubType(substitutionsArr) {
		for (let i = 0; i < substitutionsArr.length; i++) {
			let changesKeys = Object.keys(substitutionsArr[i].changes || {});
			if (changesKeys.length === 1 && changesKeys[0] === "classroom")
				substitutionsArr[i].substitution_types = ["przesunięcie do sali"];
		}
		return substitutionsArr;
	}

	/**
	 * Download, parse and save substitutions for a given day.
	 * @param {string} date Date as a string in `yyyy-dd-mm` format - for that day the substitutions will be downloaded
	 * @returns {Promise<void>} Resolves to nothing, if something fails it rejects (it *should*).
	 */
	async downloadAndSave(date) {
		let subStudentArr;
		let subTeacherArr;
		try {
			// Get cookie and gsh
			let cookieAndGsh = await this.getCookieAndGsh();
			// Download data for student and teachers
			let jsonDataStudents = this.downloadSubstitutions(date, cookieAndGsh);
			let jsonDataTeachers = this.downloadSubstitutions(date, cookieAndGsh, true);
			// Parse the downloaded data
			subStudentArr = this.parse(await jsonDataStudents);
			subTeacherArr = this.parse(await jsonDataTeachers, true);
		} catch (error) {
			console.error(error);
			throw new Error(`${new Date().toLocaleString()}: One of the substitution parsers or functions downloading data failed. The error shuld have been loged.`);
		}
		if (date != subStudentArr.date || date != subTeacherArr.date) throw new Error(`${new Date().toLocaleString()}: Requested and received substitution dates don't match`);
		// Prepare classes and teachers list
		let mergedSubArr = this.mergeSubstitutions(subStudentArr.substitution, subTeacherArr.substitution);
		// If there are substitutions try to assign them correct type
		let finalSubArr = typeof mergedSubArr === "string" ? mergedSubArr : this.assignSubType(mergedSubArr);
		let classes = this.classesList(finalSubArr);
		let teachers = this.teachersList(finalSubArr);
		let objectForDB = {
			substitution: finalSubArr,
			date: date,
			userList: classes,
			teachersList: teachers
		};
		// Call function updating teachers list
		this.updateDBTeachersList(teachers);
		// Save the substitutions
		try {
			await mongo.modifyById2(date, "substitutions", objectForDB);
			console.info(`${new Date().toLocaleString()}: Substitutions for website ${this.pageUrl} and date ${date} were updated.`);
			return;
		} catch (error) {
			throw (error);
		}
	}
}

module.exports.EduPageSubstitutions = EduPageSubstitutions;

/**
 * Object containing cookie jar and gsh parameter required for substitutions request
 * @typedef {Object} CookieAndGsh
 * @property {string} gsh `gsh` Parameter required for substitutions request
 * @property {request.CookieJar} cookieJar Cookie jar containing cookies required for substitutions request
 */

/**
 * Object containing single substitution details.
 *
 * For compatibility reasons all of the properties (except `changes`) are `Arrays`, even if most of them always contain only one element.
 * @typedef {Object} SingleSubstitution
 * @property {boolean[]} cancelled Array containing only **ONE** element (for compatibility reasons). If that element is true it means that the lesson is cancelled.
 * @property {string[]} [substitution_types] Type of a substitution - `"przesunięcie do sali"` on index 0 (if `cancelled[0]` is `false` and `changes` contains only `classrooms` key). Otherwise it doesn't exist.
 * @property {string[]} note Contains a note/comment or an empty string on index 0.
 * @property {string[]} periods Contains lesson number on index 0.
 * @property {string[]} subjects Contains subject on index 0.
 * @property {string[]} teachers Contains teacher's name on index 0.
 * @property {string[]} classes Array of classes that take part in that lesson.
 * @property {string[]} classrooms Contains classroom number/name on index 0.
 * @property {string[]} groupnames Array containing names of groups that take part in that lesson.
 * @property {string[]} [type] Always contains string `"card"` on index 0. Maybe not necessary (at least I didn't found any reference to this in code), ~but I don't want to risk other elements breaking if something uses this field~ so I will omit it 😃.
 * @property {string[]} [periodorbreak] Not used anywhere. It contained string `0<periods-1>P`. I will not include it in this object.
 * @property {boolean[]} [moje] Not used anywhere. Was always `false` (on index 0). I will not include it in this object.
 * @property {Object} [changes] Object containing fields that change in this substitution - (`subjects`, `teachers`, `classrooms` *(maybe more)*). It doesn't exist if `cancelled[0]` is `true`.
 * @property {string[]} [changes.subjects] Contains new subject on index 0.
 * @property {string[]} [changes.teachers] Contains new teacher's name on index 0.
 * @property {string[]} [changes.classrooms] Contains new classroom number/name on index 0.
 * @property {string} [rawHTML] Contains substitution data as unprocessed HTML. I have no idea how a "note" (comment) looks like, so it's required for debugging and improving this parser.
 *
 * **It should be removed somewhere in the future!** TODO: Remove when ready.
 * @property {string} [rawTHTML] Contains substitution data as unprocessed HTML for teachers.It's added for debugging purposes.
 *
 * **It should be removed somewhere in the future!** TODO: Remove when ready.
 */

/**
 * Object containing date and substitutions (or `"no substitutions"` string) returned by parser
 * @typedef {Object} ParserResponse
 * @property {SingleSubstitution[] | string} substitution Array of substitutions or `"no substitutions"` string if there are no substitutions.
 * @property {string} date Date of the substitutions
 */

/**
 * Object returned by `classesAndGroup` function
 * @typedef {Object} ClassesAndGroup
 * @property {string[]} classes Array of classes
 * @property {string} group Group name or `""` if none.
 */
