'use strict'
var Alexa = require('alexa-sdk')
var BPromise = require('bluebird')
var request = BPromise.promisifyAll(require('request').defaults({ json: true }))
var _ = require('lodash')
var moment = require('moment')
require('moment-round')
require('moment-timezone')

var APP_ID = "amzn1.ask.skill.fb8ceabb-21b7-4a1f-a554-51f3b6cc5657"
var SKILL_NAME = 'Train Spotter'

exports.handler = function(event, context, callback) {
  console.log('Starting handler..')
  var alexa = Alexa.handler(event, context)
  alexa.appId = APP_ID
  alexa.registerHandlers(handlers)
  console.log('Executing handler..')
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
    console.log('Getting departure times..')
    getTrainDepartureTimes()
      .tap(res => console.log('Getting speech output:', res))
      .then(getSpeechOutput)
      .tap(res => console.log('Getting speech output:', res))
      .then(output => this.emit(':tellWithCard', output, SKILL_NAME, output))
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
  },
  'AMAZON.RepeatIntent': function () {
    this.emit('GetTrains')
  }
}

function getTrainDepartureTimes() {
  return request.getAsync('http://rata.digitraffic.fi/api/v1/live-trains?station=KEA&arrived_trains=0&arriving_trains=0&departed_trains=0&departing_trains=10')
    .then(res => res.body.filter(notCancelledTowardsHki))
    .then(trains => _.sortBy(trains.map(train => getDepartureTime(timeTableForKera(train))).filter(notAlreadyGone)))

  function notCancelledTowardsHki(train) { return !train.cancelled && train.timeTableRows[0].stationShortCode !== 'HKI' }
  function timeTableForKera(train) { return _.find(train.timeTableRows, row => row.stationShortCode === 'KEA') }
  function getDepartureTime(train) { return train.liveEstimateTime || train.scheduledTime }
  function notAlreadyGone(departureTime) { return moment().isBefore(departureTime) }
}

function getSpeechOutput(departureTimes) {
  var departureTime1 = departureTimeText(departureTimes[0])
  var departureDuration1 = moment(departureTimes[0]).fromNow()

  return `<p>The next train leaves at ${departureTime1} - that is ${departureDuration1}.</p><p>The one after that goes at ${departureTimeText(departureTimes[1])}.</p>`

  function departureTimeText(timestamp) {
    return moment(timestamp).round(1, 'minutes').tz("Europe/Helsinki").format('kk:mm');
  }
}
//
//getTrainDepartureTimes()
//  .then(getSpeechOutput)
//  .then(output => console.log(output))