'use strict'
var Alexa = require('alexa-sdk')

var APP_ID = "amzn1.ask.skill.fb8ceabb-21b7-4a1f-a554-51f3b6cc5657"
var SKILL_NAME = 'Train Spotter'

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context)
  alexa.appId = APP_ID
  alexa.registerHandlers(handlers)
  alexa.execute()
}

var handlers = {
  'LaunchRequest': function () {
    this.emit('GetTrains')
  },
  'GetNextTrainsIntent': function () {
    this.emit('GetTrains')
  },
  "GetTrains": function () {
    var speechOutput = "The next train leaves at 22:18 - that is 15 minutes from now. The one after that goes at 22:45."
    this.emit(':tellWithCard', speechOutput, SKILL_NAME, speechOutput)
  },
  'AMAZON.HelpIntent': function () {
    var speechOutput = "You can say tell me a space fact, or, you can say exit... What can I help you with?"
    var reprompt = "What can I help you with?"
    this.emit(':ask', speechOutput, reprompt)
  },
  'AMAZON.CancelIntent': function () {
    this.emit(':tell', 'Goodbye!')
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', 'Goodbye!')
  }
}