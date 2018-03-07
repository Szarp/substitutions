const request = require("request");

/**
 * Download news section
 * @param {Function} callback callback to execute
*/
function getNews(callback){
	request("https://zso11.edupage.org/news/", (error, response, body) => {
		setImmediate(() => {
			callback(error, body);
		});
	});
}
/**
 * Get ul element with list of articles
 * @param {string} html HTML to parse
 * @param {Function} callback
*/
function getList(html, callback){
	var start = html.indexOf(">", html.indexOf("id=\"nw_newsUl\"")) + 1;
	var end = html.indexOf("</ul>", start);
	var list = html.substring(start, end);
	var error = null;
	if (list.length < 50) error = "List is too short";
	setImmediate(() => {
		callback(error, list);
	});
}
/**
 * Get array of `li` tags with their content
 * @param {string} list List to parse returned by `getList`
 * @param {Function} callback
*/
function getListElements(list, callback){
	var elements = [];
	while (list.indexOf("<li data-newid") != -1){
		let start = list.indexOf(">", list.indexOf("<li data-newid")) + 1;
		let end = list.indexOf("</li>", start);
		elements[elements.length] = list.substring(start, end);
		list = list.slice(end);
	}
	var error = null;
	if(elements.length == 0) error = "No elements found";
	setImmediate(() => {
		callback(error, elements);
	});
}
/**
 * Returns title of passed news/article
 * @param {string} element Element from array returned by `getListElements`
 * @returns {string} Title of article
*/
function getTitle(element){
	var start = element.indexOf(">", element.indexOf("<span class=\"gadgetTitle\">", element.indexOf("<h1"))) + 1;
	var end = element.indexOf("</span></h1>");
	return element.substring(start, end);
}
/**
 * Returns article content with HTML tags
 * @param {string} element Element from array returned by `getListElements`
 * @returns {string} Content of article
*/
function getRawContent(element){
	var start = element.indexOf(">", element.indexOf("<div class=\"plainText\"")) + 1;
	var end = element.indexOf("</div", start);
	return element.substring(start, end);
}
/**
 * Replace `img` tags with class and id with ones without
 * @param {string} text text which may contain `<img>` tags
 * @returns {string} text with "clean" img tags
*/
function replaceImages(text){
	var exp = /<img.*?src=['"](.*?)['"]/g;
	return text.replace(exp, "<img src=\"$1\""); //closing tag remains
}
/**
 * Returns received text without `&nbsp;`, newlines and empty `<p></p>` tags, add links using `replaceURLWithHTMLLinks()` and change `<img>` tags using `replaceImages()`
 * @param {string} text text to parse
 * @returns {string} ready string
*/
function replaceSymbols(text){
	return replaceImages(replaceURLWithHTMLLinks(text.replace(/(&nbsp;)/g, " ").replace(/<p> <\/p>/g, "").replace(/\r?\n|\r/g, "")));
}
/**
 * Adds links to text passed as parameter. URLs in HTML tags are not parsed to avoid `<a href="<a href='link'>link</a>">link</a>`
 * @param {string} text text to parse
 * @returns {string} Parsed string
*/
function replaceURLWithHTMLLinks(text){
	var exp = /(?:^|[^"'])(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig;
	return text.replace(exp, " <a href=\"$1\">$1</a>");
}
/**
 * Generate HTML that will be displayed when user asks for an article
 * @param {string} title title of an article extracted by `getTitle`
 * @param {string} content content of an article extaracted by `getRawContent`
 * @param {Function} callback callback to execute, one paramter passed - generated HTML
*/
function createHTML(title, content, callback){
	content = replaceSymbols(content);
	var html = `<!DOCTYPE html>
<html>
<head>
	<title>` + title + `</title>
	<meta charset="utf-8">
	<link rel="stylesheet" href="https://anulowano.pl/demo/mdStyle.css">
</head>
<body class="markdown-body">
<h1>` + title + `</h1>
` + content + `
</body>
</html>`;
	setImmediate(() => {
		callback(html);
	});
}
getNews((error, html) => {
	if(error){
		console.error(error);
	} else {
		getList(html, (error, list) => {
			getListElements(list, (error, elements) => {
				for(let a = 0; a < elements.length; a++){
					var title = getTitle(elements[a]);
					var content = getRawContent(elements[a]);
					if(content != "Dane z programu Zastępstwa zostały zaktualizowane"){ //ignore news about new substitutions
						createHTML(title, content, result => {
							console.log(result + "\n");
						});
					}
				}
			});
		});
	}
});
