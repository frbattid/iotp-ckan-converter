var config = require('../conf/configuration.json')
var request = require('request');
var fs = require('fs');
var tmp = require('tmp');
var json2csv = require('json2csv');
var js2xmlparser = require("js2xmlparser");
var async_ = require('async');

function checkFileStoreResourceExistence (format, callback) {
  var fileStoreResourceId = null;

  var dataStoreSearchOptions = {
    method: 'GET',
    uri: config.connection.endpoint + '/api/3/action/datastore_search?resource_id=' + config.data.resource_id,
    headers: {
      'Authorization': config.connection.authentication
    },
    rejectUnauthorized: false
  } // dataStoreSearchOptions

  callback(fileStoreResourceId);
} // checkFileStoreResourceExistence

function convert (records, format, callback) {
  // Create a temporary file where to save the Json version of the records
  var tmpFile = tmp.fileSync({postfix: '.' + config.data.resource_name + '.' + format.toLowerCase()});

  // Iterate on the records in order to append their content in the temporary file
  if (format === 'CSV') {
    var fieldsStr = JSON.stringify(config.data.datastore_fields);
    fs.appendFileSync(tmpFile.name, fieldsStr.substring(1, fieldsStr.length - 1) + '\n');
  } // if

  if (format === 'XML') {
    fs.appendFileSync(tmpFile.name, '<?xml version=\'1.0\'?>\n');
    fs.appendFileSync(tmpFile.name, '<records>\n');
  } // if

  for (var record of records) {
    switch (format) {
      case 'Json':
        fs.appendFileSync(tmpFile.name, JSON.stringify(record) + '\n');
        break;
      case 'CSV':
        try {
          var csvRecord = json2csv({data: record, fields: config.data.datastore_fields});
          fs.appendFileSync(tmpFile.name, csvRecord.split('\n')[1] + '\n');
        } catch (err) {
          console.error(err);
        } // try catch

        break;
      case 'XML':
        try {
          var xmlRecord = js2xmlparser.parse("record", record);
          fs.appendFileSync(tmpFile.name, xmlRecord.substring(xmlRecord.indexOf("\n") + 1) + '\n');
        } catch (err) {
          console.error(err);
        } // try catch

        break;
      default:
        console.log('Unknown format');
    } // switch
  } // for

  if (format === 'XML') {
    fs.appendFileSync(tmpFile.name, '</records>\n');
  } // if

  // Common request options for FileStore create or update
  var fileStoreOptions = {
    method: 'POST',
    uri: 'tobesetlater',
    headers: {
      'Authorization': config.connection.authentication,
      'Content-Type': 'multipart-form-data'
    },
    formData: { // These are form fields named as required by CKAN's FileStore
      //package_id: config.data.package_id,
      name: config.data.resource_name + '.' + format.toLowerCase(),
      description: 'A FileStore-based ' + format + ' version of ' + config.data.resource_name + ' resource (originally, within the DataStore)',
      upload: fs.createReadStream(tmpFile.name),
      format: format,
      url: 'tobesetbyCKAN'
    },
    rejectUnauthorized: false
  } // fileStoreOptions

  checkFileStoreResourceExistence(format, function(fileStoreResourceId) {
    // Set additional options depending on the resource existence
    if (fileStoreResourceId == null) {
      fileStoreOptions.uri = config.connection.endpoint + '/api/3/action/resource_create';
      fileStoreOptions.package_id = config.data.package_id;
    } else {
      fileStoreOptions.uri = config.connection.endpoint + '/api/3/action/resource_update'
      fileStoreOptions.id = fileStoreResourceId;
    } // if else

    // Request callback
    function fileStoreCreateCallback (error, response, body) {
      console.log('<< Response from CKAN (POST ' + fileStoreOptions.uri + ')');
      console.log('<<   Error:      ', error);
      console.log('<<   Status code:', response && response.statusCode);
      console.log('<<   Body:       ', body);
      console.log('\n');

      // Clean up the temporary file
      tmpFile.removeCallback();

      // Callback
      callback();
    } // fileStoreCreateCallback

    // Do the request to CKAN's FileStore
    request(fileStoreOptions, fileStoreCreateCallback);
  });
} // convert

// Total array of records
var records = [];

var dataStoreSearchOptions = {
  method: 'GET',
  uri: config.connection.endpoint + '/api/3/action/datastore_search?resource_id=' + config.data.resource_id,
  headers: {
    'Authorization': config.connection.authentication
  },
  rejectUnauthorized: false
} // dataStoreSearchOptions

function dataStoreSearchCallback (error, response, body) {
  console.log('<< Response from CKAN (GET ' + dataStoreSearchOptions.uri + ')');
  console.log('<<   Error:      ', error);
  console.log('<<   Status code:', response && response.statusCode);
  //console.log('<<   Body:       ', body);
  console.log('\n');
  var jsonBody = JSON.parse(body);

  if (jsonBody.result.total == undefined) {
    async_.series([
      async_.apply(convert, records, 'Json'),
      async_.apply(convert, records, 'CSV'),
      async_.apply(convert, records, 'XML')
    ], function (err, results) {
      console.log(results);
    });
  } else {
    // Add current subset of records to all records array
    jsonBody.result.records.forEach(function(item) {
      records.push(item);
    });

    // Prepare a new request to the next data page
    dataStoreSearchOptions.uri = config.connection.endpoint + jsonBody.result._links.next;

    // Do the request to the next page of the DataStore
    request(dataStoreSearchOptions, dataStoreSearchCallback);
  } // if else
} // dataStoreSearchCallback

// Do the request to first page of the DataStore
request(dataStoreSearchOptions, dataStoreSearchCallback);
