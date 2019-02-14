// First versions
let przesunięcieRegExp = /^(?:(?<groupName>[\w\W]*): )?(?<subject>[\w\W]*) - Zmień salę lekcyjną: \((?<classroom>[\w\W]*)\) ➔ (?<newClassroom>[\w\W]*)$/;
let bezZmianyPrzedmiotu = /^(?:(?<groupName>[\w\W]*?): )?(?<subject>[\w\W]*?) - Zastępstwa: \((?<teacher>[\w\W]*?)\) ➔ (?<newTeacher>[\w\W]*?)(?:, Zmień salę lekcyjną: \((?<classroom>[\w\W]*?)\) ➔ (?<newClassroom>[\w\W]*?))?$/; //zmiana sali opcjonalna
let pełneZastępstwoRegExp = /^(?:(?<groupName>[\w\W]*): )?\((?<subject>[\w\W]*)\) ➔ (?<newSubject>[\w\W]*) - Zastępstwa: \((?<teacher>[\w\W]*)\) ➔ (?<newTeacher>[\w\W]*), Zmień salę lekcyjną: \((?<classroom>[\w\W]*)\) ➔ (?<newClassroom>[\w\W]*)$/;

// These should be working

/**
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
 * The result (of `.exec()`) contains following groups:
 * - `groupName` - optional, contains group name
 * - `subject` - (old) subject of the lesson if there is a change of subject
 * - `newSubject` - new subject of the lesson if there is a change of subject
 * - `subject2` - subject of the lesson if the subject doesn't change
 * - `teacher` - teacher, only if there's a techer change
 * - `newTeacher` - substituting teacher (if any)
 * - `classroom` - classroom number/name if students have to change the classroom
 * - `newClassroom` - new classroom number - where the students should go.
 */
const idealnyReExp = /^(?:(?<groupName>[\w\W]*): )?(?:\((?<subject>[\w\W]*)\) ➔ (?<newSubject>[\w\W]*)|(?<subject2>[\w\W]*)) - (?:Zastępstwa: \((?<teacher>[\w\W]*?)\) ➔ (?<newTeacher>[\w\W]*?))?(?:, )?(?:Zmień salę lekcyjną: \((?<classroom>[\w\W]*)\) ➔ (?<newClassroom>[\w\W]*))?$/;

/**
 * Same as `idealnyRegExp`, but it can also select and capture note/comment (***BETA***).
 * Following tests results are the same for both of these regular expressions, so I assume that it didn't break anything.
 */
const withNoteBeta = /^(?:(?<groupName>[\w\W]*): )?(?:\((?<subject>[\w\W]*)\) ➔ (?<newSubject>[\w\W]*)|(?<subject2>[\w\W]*)) - (?:Zastępstwa: \((?<teacher>[\w\W]*?)\) ➔ (?<newTeacher>[\w\W]*?))?(?:, )?(?:Zmień salę lekcyjną: \((?<classroom>[\w\W]*)\) ➔ (?<newClassroom>[\w\W]*?))?(?:, (?<note>[\w\W]*))?$/;

const substitutionTypes = {
	classroomOnly: "subject name - Zmień salę lekcyjną: (classroom 1) ➔ classroom 2",
	classroomAndGroup: "group name 1: subject name 8 - Zmień salę lekcyjną: (classroom 1) ➔ classroom 2",
	teacherOnly: "subject name - Zastępstwa: (teacher 1) ➔ teacher 2",
	teacherAndGroup: "group name1: subject name - Zastępstwa: (teacher 1) ➔ teacher 2",
	teacherAndClassroom: "subject name1 - Zastępstwa: (teacher 1) ➔ teacher 2, Zmień salę lekcyjną: (classroom 1) ➔ classsroom 2",
	teacherClassroomAndGroup: "group name: subject name1 - Zastępstwa: (teacher 1) ➔ teacher 2, Zmień salę lekcyjną: (classroom 1) ➔ classsroom 2",
	subjectAndTeacher: "(subject name 1) ➔ subject name 2 - Zastępstwa: (teacher 1) ➔ teacher 2",
	subjectTeacherAndGroup: "group name: (subject name 1) ➔ subject name 2 - Zastępstwa: (teacher 1) ➔ teacher 2",
	subjectTeacherAndClassroom: "(subject name 1) ➔ subject name 2 - Zastępstwa: (teacher 1) ➔ teacher 2, Zmień salę lekcyjną: (classroom 1) ➔ classroom 2",
	subjectTeacherClassroomAndGroup: "group name: (subject name 1) ➔ subject name 2 - Zastępstwa: (teacher 1) ➔ teacher 2, Zmień salę lekcyjną: (classroom 1) ➔ classroom 2"
};

const knownGoodResult = `[{"classroom":"classroom 1","newClassroom":"classroom 2","subject":"subject name"},{"groupName":"group name 1","classroom":"classroom 1","newClassroom":"classroom 2","subject":"subject name 8"},{"teacher":"teacher 1","newTeacher":"teacher 2","subject":"subject name"},{"groupName":"group name1","teacher":"teacher 1","newTeacher":"teacher 2","subject":"subject name"},{"teacher":"teacher 1","newTeacher":"teacher 2","classroom":"classroom 1","newClassroom":"classsroom 2","subject":"subject name1"},{"groupName":"group name","teacher":"teacher 1","newTeacher":"teacher 2","classroom":"classroom 1","newClassroom":"classsroom 2","subject":"subject name1"},{"subject":"subject name 1","newSubject":"subject name 2","teacher":"teacher 1","newTeacher":"teacher 2"},{"groupName":"group name","subject":"subject name 1","newSubject":"subject name 2","teacher":"teacher 1","newTeacher":"teacher 2"},{"subject":"subject name 1","newSubject":"subject name 2","teacher":"teacher 1","newTeacher":"teacher 2","classroom":"classroom 1","newClassroom":"classroom 2"},{"groupName":"group name","subject":"subject name 1","newSubject":"subject name 2","teacher":"teacher 1","newTeacher":"teacher 2","classroom":"classroom 1","newClassroom":"classroom 2"}]`;

var allInOne = [];
for (const key in substitutionTypes) {
	if (substitutionTypes.hasOwnProperty(key)) {
		const test = substitutionTypes[key];
		let res = withNoteBeta.exec(test).groups;
		for (const group in res) {
			const str = res[group];
			if(str === undefined){
				delete res[group];
			}
		}
		if(res.subject2 !== undefined && res.subject === undefined){
			res.subject = res.subject2;
			delete res.subject2;
		} else if (res.subject2 !== undefined && res.subject !== undefined){
			throw new Error("OR operator (|) failed - both subject and subject2 are declared. Something is wrong with the JS engine.");
		}
		console.log(`Test ${key}:`);
		console.table(res);
		allInOne.push(res);
	}
}
console.log(`Is the RegExp result correct: ${JSON.stringify(allInOne) == knownGoodResult}`);