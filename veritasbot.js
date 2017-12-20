'use strict';
const builder = require('botbuilder');

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});


function familyMemberFunction() {
    return {
        memberPerson: '',
        memberName: '',
        bornPlace: '',
        memberAge: '',
        twin: '',
        adopted: '',
        living: '',
        causeOfDeath: '',
        deathAge: '',
        diagnosedCancer: '',
        cancerType: '',
        diagnosisAge: '',
        geneticTesting: '',
        genTestName: '',
        genLabName: '',
        genFindings: '',
        heORshe: '',
        hisORher: ''
    }
};


var intent = 0;
var familyMember = familyMemberFunction();
var familyMembersResults = [];


const bot = module.exports = new builder.UniversalBot(connector, [
    function (session, results) {
        switch (intent) {
            case 0:
                session.beginDialog('begin');
                break;
            case 'getAge':
                familyMember.bornPlace = session.message.value.place;
                intent = 0;
                session.beginDialog('getAge');
                break;
            case 'getName':
                familyMember.memberPerson = session.message.value.familyMemberPerson;
                if (familyMember.memberPerson == 'Mother' || familyMember.memberPerson == 'GrandMother' || familyMember.memberPerson == 'Aunt' || familyMember.memberPerson == 'Daughter' || familyMember.memberPerson == 'Sister' || familyMember.memberPerson == 'niece') {
                    familyMember.heORshe = 'she';
                    familyMember.hisORher = 'her';
                } else {
                    familyMember.heORshe = 'he';
                    familyMember.hisORher = 'his';
                }
                intent = 0;
                session.beginDialog('getName');
                break;
            case 'end':
                session.send('Thank you. We are done');
                intent = 0;
                session.endConversation();
                session.beginDialog('otherMember');
                break;
            case 'askForMoreMembers':
                familyMember.cancerType = session.message.value.cancerType;
                familyMember.diagnosisAge = session.message.value.diagnosticAge;
                familyMember.geneticTesting = session.message.value.geneticTesting;
                if (session.message.value.geneticTesting == 'Yes') {
                    familyMember.genTestName = session.message.value.testName;
                    familyMember.genLabName = session.message.value.laboratoryName;
                    familyMember.genFindings = session.message.value.findings;
                } else {
                    familyMember.genTestName = '';
                    familyMember.genLabName = '';
                    familyMember.genFindings = '';
                }
                intent = 0;
                session.beginDialog('otherMember');
                break;
            default:
                session.send("We had some problems. Let's start over")
                intent = 0;
                session.endConversation();
                break;
        }

    }
]);

bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                //bot.beginDialog(message.address, 'begin');
                intent = 0;
            }
        });
    }
});



bot.dialog('begin', [
    function (session) {
        session.send("Hi, I am Eva. I am a chatbot in training, so please be patient with me.");
        builder.Prompts.choice(session, "In order to better provide you with useful information on your genetic makeup, I need to ask you some question. Is that OK?", "Yes|No");
    },
    function (session, results) {
        if (results.response.entity == 'Yes') {
            session.endDialog();
            session.beginDialog('ready');
        } else {
            session.send(`Let me know when you are ready`);
            session.endConversation();
        }
    }
]);


bot.dialog('ready', [
    function (session) {
        session.send('You can answer by typing the answer, for example: "No" or "no" or you can type the number that corresponds to the answer.');
        builder.Prompts.choice(session, "Ready?", "Yes|No");
    },
    function (session, results) {
        if (results.response.entity == 'Yes') {
            session.endDialog();
            session.beginDialog('familyCancer');
        } else {
            session.send(`Let me know when you are ready`);
            intent = 0;
            session.endConversation();
        }
    }
]);



bot.dialog('familyCancer', [
    function (session) {
        builder.Prompts.choice(session, "Does anyone in your family have a history of cancer?", "Yes|No|I don't know");
    },
    function (session, results) {
        if (results.response.entity == 'Yes') {
            session.endDialog();
            session.beginDialog('getMember');
        } else {
            session.send(`I'm glad to hear that. I do not have more questions.`);
            session.send('We are done.')
            intent = 0;
            session.endConversation();
        }
    }
]);


bot.dialog('getMember', [
    function (session) {
        session.send('Please choose the family member from your mother or father side.')
        var msg = new builder.Message(session)
            .addAttachment(cardFamilyMember);
        session.send(msg);
        intent = 'getName';
        session.endDialog();

    }
])


bot.dialog('getName', [
    function (session) {
        setTimeout(function () {
            session.send(`Please complete the following information about your ${familyMember.memberPerson}`);
            setTimeout(function () {
                builder.Prompts.text(session, `What is ${familyMember.hisORher} first name?`);
            }, 1500)
        }, 1000)
    },
    function (session, results) {
        familyMember.memberName = results.response;
        session.endDialog();
        intent = 0;
        session.beginDialog('getBornPlace');
    }
]);

bot.dialog('getBornPlace', [
    function (session) {
        session.send(`In what country was ${familyMember.heORshe} born?`)
        var msg = new builder.Message(session)
            .addAttachment(card);
        session.send(msg);
        intent = 'getAge';
        session.endDialog();

    }
])


bot.dialog('getAge', [
    function (session) {
        builder.Prompts.text(session, `What year was  ${familyMember.heORshe} born?`);
    },
    function (session, results) {
        familyMember.memberAge = results.response;
        if (results.response.toLowerCase() != "i don't know" && results.response.toLowerCase() != "i do not know") {
            let ageNumber = parseInt(results.response);
            if (isNaN(ageNumber)) {
                session.send(`Please enter an age between 1900 and 2005 or enter or "I don't know" or "I do not know"`);
                session.beginDialog('getAge');
            } else if (ageNumber < 1900 || ageNumber > 2005) {
                session.send(`Please enter an age between 1900 and 2005 or enter or "I don't know" or "I do not know"`);
                session.beginDialog('getAge');
            } else {
                session.endDialog();
                intent = 0;
                session.beginDialog('twin');
            }
        }
        else {
            session.endDialog();
            intent = 0;
            session.beginDialog('twin');
        }
    }
]);


bot.dialog('twin', [
    function (session) {
        builder.Prompts.choice(session, `Was ${familyMember.heORshe} born a twin?`, `Yes/Identical|Yes/Fraternal|No|I don't know`);
    },
    function (session, results) {
        familyMember.twin = results.response.entity;
        session.endDialog();
        intent = 0;
        session.beginDialog('adopted');
    }
]);

bot.dialog('adopted', [
    function (session) {
        builder.Prompts.choice(session, `Was ${familyMember.heORshe} adopted?`, `Yes|No|I don't know`);
    },
    function (session, results) {
        familyMember.adopted = results.response.entity;
        session.endDialog();
        intent = 0;
        session.beginDialog('living');
    }
]);

bot.dialog('living', [
    function (session) {
        builder.Prompts.choice(session, `Is ${familyMember.heORshe} living?`, `Yes|No|I don't know`);
    },
    function (session, results) {
        familyMember.living = results.response.entity;
        if (familyMember.living === 'No') {
            session.endDialog();
            intent = 0;
            session.beginDialog('causeOfDeath');
        } else {
            session.endDialog();
            intent = 0;
            session.beginDialog('cancer');
        }

    }
]);


bot.dialog('causeOfDeath', [
    function (session) {
        session.send(`Sorry to hear that your ${familyMember.memberPerson} has passed.`);
        setTimeout(function () {
            builder.Prompts.text(session, `Do you know the cause of death?`)
        }, 1500)
    },
    function (session, results) {
        familyMember.causeOfDeath = results.response;
        session.endDialog();
        intent = 0;
        session.beginDialog('ageOfDeath');
    }
]);

bot.dialog('ageOfDeath', [
    function (session) {
        builder.Prompts.text(session, `How old was ${familyMember.heORshe} when ${familyMember.heORshe} passed?`);
    },
    function (session, results) {
        familyMember.deathAge = results.response;
        if (isNaN(familyMember.deathAge) & results.response.toLowerCase() !== "i don't know" & results.response.toLowerCase() !== "i do not know") {
            session.send(`Please enter a number or if you do not know, enter "I don't know or I do not know "  `);
            session.beginDialog('ageOfDeath');
        } else {
            session.endDialog();
            session.beginDialog('cancer');
        }

    }
]);

bot.dialog('cancer', [
    function (session) {
        builder.Prompts.choice(session, `Has ${familyMember.heORshe} ever been diagnosed with cancer?`, `Yes|No|I don't know`);
    },
    function (session, results) {
        familyMember.diagnosedCancer = results.response.entity;
        if (results.response.entity == 'Yes') {
            session.endDialog();
            intent = 0;
            session.beginDialog('cancerTypes');
        } else {
            session.endDialog();
            intent = 0;
            session.beginDialog('otherMember');
        }
    }
]);



bot.dialog('cancerTypes', [
    function (session) {
        session.send('What type of cancer?')
        var msg = new builder.Message(session)
            .addAttachment(cardCancerTypes);
        session.send(msg);
        intent = 'askForMoreMembers';
        session.endDialog();

    }
])


bot.dialog('otherMember', [
    function (session) {
        builder.Prompts.choice(session, "Does anyone else in your family have a history of cancer?", "Yes|No|I don't know");
    },
    function (session, results) {
        familyMembersResults.push(familyMember);
        if (results.response.entity == 'Yes') {
            session.endDialog();
            intent = 0;
            session.beginDialog('getMember');
        } else {
            session.send('Ok then.');
            session.send('Thank you for your time.');
            session.send('We are done.');
            intent = 0;
            session.endConversation();
        }
    }
]);



const card = {
    'contentType': 'application/vnd.microsoft.card.adaptive',
    'content': {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        'type': 'AdaptiveCard',
        'version': '1.0',
        'body': [
            {
                "type": "TextBlock",
                "text": "Country"
            },
            {
                "type": "Input.ChoiceSet",
                "id": "place",
                "style": "compact",
                "value": "USA",
                "choices": [
                    {
                        "title": "USA",
                        "value": "USA",
                        "isSelected": true
                    },
                    {
                        "title": "England",
                        "value": "England"
                    },
                    {
                        "title": "Germany",
                        "value": "Germany"
                    },
                    {
                        "title": "Austria",
                        "value": "Austria"
                    },
                    {
                        "title": "Australia",
                        "value": "Australia"
                    },
                    {
                        "title": "Kanada",
                        "value": "Kanada"
                    },
                    {
                        "title": "Japan",
                        "value": "Japan"
                    },
                    {
                        "title": "Don't know",
                        "value": "Don't know"
                    }
                ]
            }
        ],
        'actions': [
            {
                'type': 'Action.Submit',
                'title': 'Choose',
                'speak': '<s>Submit</s>'

            }
        ]
    }
};



const cardCancerTypes = {
    'contentType': 'application/vnd.microsoft.card.adaptive',
    'content': {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        'type': 'AdaptiveCard',
        'version': '1.0',
        'body': [
            {
                "type": "TextBlock",
                "text": "Cancer type"
            },
            {
                "type": "Input.ChoiceSet",
                "id": "cancerType",
                "style": "compact",
                "value": "Breast cancer",
                "choices": [
                    {
                        "title": "Breast cancer",
                        "value": "Breast cancer",
                        "isSelected": true
                    },
                    {
                        "title": "Colorectal cancer",
                        "value": "Colorectal cancer"
                    },
                    {
                        "title": "Kidney cancer",
                        "value": "Kidney cancer"
                    },
                    {
                        "title": "Liver cancer",
                        "value": "Liver cancer"
                    },
                    {
                        "title": "Pancreatic cancer",
                        "value": "Pancreatic cancer"
                    },
                    {
                        "title": "Neuro/endocrine cancer",
                        "value": "Neuro/endocrine cancer"
                    },
                    {
                        "title": "Ovarian cancer",
                        "value": "Ovarian cancer"
                    },
                    {
                        "title": "Pancreatic cancer",
                        "value": "Pancreatic cancer"
                    },
                    {
                        "title": "Skin cancer",
                        "value": "Skin cancer"
                    },
                    {
                        "title": "Stomach cancer",
                        "value": "Stomach cancer"
                    },
                    {
                        "title": "Bladder & urinary tract cancer",
                        "value": "Bladder & urinary tract cancer"
                    },
                    {
                        "title": "Uterus cancer",
                        "value": "Uterus cancer"
                    },
                    {
                        "title": "Testicular germ cell cancer",
                        "value": "Testicular germ cell cancer"
                    },
                    {
                        "title": "Prostate cancer",
                        "value": "Prostate cancer"
                    },
                    {
                        "title": "Other",
                        "value": "Other"
                    }
                ]
            }
        ],
        'actions': [
            {
                'type': 'Action.ShowCard',
                'title': 'Submit',
                'card': {
                    'type': "AdaptiveCard",
                    'body': [
                        {
                            "type": "TextBlock",
                            "text": "Diagnosis age"
                        },
                        {
                            "type": "Input.ChoiceSet",
                            "id": "diagnosticAge",
                            "style": "compact",
                            "value": "As a teenager",
                            "choices": [
                                {
                                    "title": "As a teenager",
                                    "value": "As a teenager",
                                    "isSelected": true

                                },
                                {
                                    "title": "In their 20's",
                                    "value": "In their 20's",

                                },
                                {
                                    "title": "In their 30's",
                                    "value": "In their 30's"
                                },
                                {
                                    "title": "In their 40's",
                                    "value": "In their 40's"
                                },
                                {
                                    "title": "In their 50's",
                                    "value": "In their 60's"
                                },
                                {
                                    "title": "In their 60's",
                                    "value": "In their 60's"
                                },
                                {
                                    "title": "In their 70's",
                                    "value": "In their 70's"
                                },
                                {
                                    "title": "I don't know",
                                    "value": "I don't know"
                                }
                            ]
                        },
                        {
                            "type": "TextBlock",
                            "text": "Genecit Testing "
                        },
                        {
                            "type": "Input.ChoiceSet",
                            "id": "geneticTesting",
                            "style": "expanded",
                            "value": "No",
                            "choices": [
                                {
                                    "title": "Yes",
                                    "value": "Yes"
                                },
                                {
                                    "title": "No",
                                    "value": "No",
                                    "isSelected": true
                                },
                                {
                                    "title": "I don't know",
                                    "value": "I don't know"
                                }
                            ]
                        },
                        {
                            "type": "TextBlock",
                            "text": "Fill the next 3 fields just if you answerd",
                            'weight': 'bolder'

                        },
                        {
                            "type": "TextBlock",
                            "text": "Genetic testing with Yes",
                            'weight': 'bolder'

                        },
                        {
                            "type": "Input.Text",
                            "id": "testName",
                            "placeholder": "Enter TestName",
                            "maxLength": 500,
                        },
                        {
                            "type": "Input.Text",
                            "id": "laboratoryName",
                            "placeholder": "Enter LaboratoryName",
                            "maxLength": 500,
                        },
                        {
                            "type": "Input.Text",
                            "id": "findings",
                            "placeholder": "Enter Findings",
                            "maxLength": 500,
                        }

                    ],
                    'actions': [
                        {
                            "type": "Action.Submit",
                            "title": "Submit"
                        }
                    ]

                }

            }
        ]
    }
};




const cardFamilyMember = {
    'contentType': 'application/vnd.microsoft.card.adaptive',
    'content': {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        'type': 'AdaptiveCard',
        'version': '1.0',
        'body': [
            {
                "type": "TextBlock",
                "text": "Family Member"
            },
            {
                "type": "Input.ChoiceSet",
                "id": "familyMemberPerson",
                "style": "compact",
                "value": "Father",
                "choices": [

                    {
                        "title": "GrandMother(MotherSide)",
                        "value": "GrandMother"
                    },
                    {
                        "title": "GrandFather(MotherSide)",
                        "value": "GrandFather"
                    },
                    {
                        "title": "GrandMother(FatherSide)",
                        "value": "GrandMother"
                    },
                    {
                        "title": "GrandFather(FatherSide)",
                        "value": "GrandFather"
                    },
                    {
                        "title": "Mother",
                        "value": "Mother"

                    },
                    {
                        "title": "Father",
                        "value": "Father",
                        "isSelected": true
                    },
                    {
                        "title": "Brother",
                        "value": "Brother"
                    },
                    {
                        "title": "Sister",
                        "value": "Sister"
                    },
                    {
                        "title": "Son",
                        "value": "Son"
                    },
                    {
                        "title": "Daughter",
                        "value": "Daughter"
                    },
                    {
                        "title": "Aunt(MotherSide)",
                        "value": "Aunt"
                    },
                    {
                        "title": "Uncle(MotherSide)",
                        "value": "Uncle"
                    },

                    {
                        "title": "Aunt(FatherSide)",
                        "value": "Aunt"
                    },
                    {
                        "title": "Uncle(FatherSide)",
                        "value": "Uncle"
                    },


                    {
                        "title": "Cousin(MotherSide)",
                        "value": "Cousin"
                    },
                    {
                        "title": "Cousin(FatherSide)",
                        "value": "Cousin"
                    },
                    {
                        "title": "niece(FatherSide)",
                        "value": "niece"
                    },
                    {
                        "title": "niece(MotherSide)",
                        "value": "niece"
                    },
                    {
                        "title": "nephew(FatherSide)",
                        "value": "nephew"
                    },
                    {
                        "title": "nephew(MotherSide)",
                        "value": "nephew"
                    }
                ]
            }
        ],
        'actions': [
            {
                'type': 'Action.Submit',
                'title': 'Choose',
                'speak': '<s>Submit</s>'

            }
        ]
    }
};