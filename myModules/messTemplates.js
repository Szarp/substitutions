

/*

Mess templates

*/
function quickReplayTest(id){
    
    
}
function helpPageMessage(id){
    return{
        "recipient":{"id":id},
        "message": {
            "attachment": {"type": "template",
                "payload": {
                "template_type": "list",
                "elements": [
                {
                    "title": "Zastępstwa dla szkół",
                    "image_url": "http://www.zso11.zabrze.pl/wp-content/uploads/2017/03/galeria-1-1024x687.jpg",
                    "subtitle": "O aplikacji",
                    "buttons": [
                        {
                            "title": "Odwiedź stronę",
                            "type": "web_url",
                            "url": "https://anulowano.pl/demo/helpPage.htm",
                            "messenger_extensions": true,
                            "webview_height_ratio": "full",
                            "fallback_url": "https://anulowano.pl/demo/helpPage.htm"                        
                        }
                    ]
                },
                {
                    "title": "Funkcje szkolne",
                    "subtitle": "Dowiadywanie się o zastępstwach; komunikacja z adminem; powiadomienia autom.",
                    "buttons": [
                        {
                            "title": "Czytaj więcej",
                            "type": "web_url",
                            "url": "https://anulowano.pl/demo/changes.htm",
                            "messenger_extensions": true,
                            "webview_height_ratio": "full",
                            "fallback_url": "https://anulowano.pl/demo/changes.htm"                        
                        }
                    ]              
                },
                {
                    "title": "Olipiada",
                    "image_url":"https://anulowano.pl/demo/zwt.png",
                    "subtitle": "Projekt jest rozwijany na potrzeby olimiady projektow społecznych",
                    "buttons": [
                        {
                            "title": "Więcej Info",
                            "type": "web_url",
                            "url": "https://anulowano.pl/demo/olimpiada.htm",
                            "messenger_extensions": true,
                            "webview_height_ratio": "full",
                            "fallback_url": "https://anulowano.pl/demo/olimpiada.htm"                        
                        }
                    ]                   
                }
                ]
                }
            }
        }   
    }
}
function helpPage_zckoiz(id){
    return{
        "recipient":{"id":id},
        "message": {
            "attachment": {"type": "template",
                "payload": {
                "template_type": "list",
                "elements": [
                {
                    "title": "Zastępstwa dla szkół",
                    "image_url": "http://www.zckoiz.zabrze.pl/images/loga/baner_szkola.jpg",
                    "subtitle": "O aplikacji",
                    "buttons": [
                        {
                            "title": "Odwiedź stronę",
                            "type": "web_url",
                            "url": "https://anulowano.pl/demo/helpPage.htm",
                            "messenger_extensions": true,
                            "webview_height_ratio": "full",
                            "fallback_url": "https://anulowano.pl/demo/helpPage.htm"                        
                        }
                    ]
                },
                {
                    "title": "Instrukcja",
                    "subtitle": "Dowiadywanie się o zastępstwach; powiadomienia autom.",
                    "buttons": [
                        {
                            "title": "Czytaj więcej",
                            "type": "web_url",
                            "url": "https://anulowano.pl/demo/changes.htm",
                            "messenger_extensions": true,
                            "webview_height_ratio": "full",
                            "fallback_url": "https://anulowano.pl/demo/changes.htm"                        
                        }
                    ]              
                },
                {
                    "title": "Olipiada",
                    "image_url":"https://anulowano.pl/demo/zwt.png",
                    "subtitle": "Projekt jest rozwijany na potrzeby olimiady projektow społecznych",
                    "buttons": [
                        {
                            "title": "Więcej Info",
                            "type": "web_url",
                            "url": "https://anulowano.pl/demo/olimpiada.htm",
                            "messenger_extensions": true,
                            "webview_height_ratio": "full",
                            "fallback_url": "https://anulowano.pl/demo/olimpiada.htm"                        
                        }
                    ]                   
                }
                ]
                }
            }
        }   
    }
}
function unreadMessage(id){
    return{
        "recipient":{"id":id},
        "message": {
            "metadata": "<DEVELOPER_DEFINED_METADATA_STRING>",
            "attachment": {"type": "template",
                "payload": {
                "template_type": "generic",
                "elements": [
                {
                    "title": "Nowa wiadomość",
                    "subtitle": "Nowa wiadomość od aministracji",
                    "buttons": [
                        {
                            "title": "Odwiedź stronę",
                            "type": "web_url",
                            "url": "https://anulowano.pl/demo/helpPage.htm",
                            "messenger_extensions": true,
                            "webview_height_ratio": "full",
                            "fallback_url": "https://anulowano.pl/demo/helpPage.htm"                        
                        }
                    ]
                }
                ]
                }
            }
        }   
    }
}
exports.helpPage=helpPageMessage;
exports.helpPage_zckoiz=helpPage_zckoiz;
exports.unreadMessage=unreadMessage;
exports.quickReplayTest= quickReplayTest;
    