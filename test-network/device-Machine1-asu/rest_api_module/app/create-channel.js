/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
var fs = require('fs');
var path = require('path');

var helper = require('./helper.js');
var logger = helper.getLogger('Create-Channel');

var createChannel = async function(channelName, channelConfigPath, username, orgName) {
	logger.debug('\n====== Creating Channel \'' + channelName + '\' ======\n');
	try {
		var client = await helper.getClientForOrg(orgName);
		logger.debug('Successfully got the fabric client for the organization "%s"', orgName);

		var envelope = fs.readFileSync(path.join(__dirname, channelConfigPath));
		var channelConfig = client.extractChannelConfig(envelope);

		let signature = client.signChannelConfig(channelConfig);

		let request = {
			config: channelConfig,
			signatures: [signature],
			name: channelName,
			txId: client.newTransactionID(true) 
		};

		const result = await client.createChannel(request)
		logger.debug(' result ::%j', result);
		if (result) {
			if (result.status === 'SUCCESS') {
				logger.debug('Successfully created the channel.');
				const response = {
					success: true,
					message: 'Channel \'' + channelName + '\' created Successfully'
				};
				return response;
			} else {
				logger.error('Failed to create the channel. status:' + result.status + ' reason:' + result.info);
				const response = {
					success: false,
					message: 'Channel \'' + channelName + '\' failed to create status:' + result.status + ' reason:' + result.info
				};
				return response;
			}
		} else {
			logger.error('\n!!!!!!!!! Failed to create the channel \'' + channelName +
				'\' !!!!!!!!!\n\n');
			const response = {
				success: false,
				message: 'Failed to create the channel \'' + channelName + '\'',
			};
			return response;
		}
	} catch (err) {
		logger.error('Failed to initialize the channel: ' + err.stack ? err.stack :	err);
		throw new Error('Failed to initialize the channel: ' + err.toString());
	}
};

exports.createChannel = createChannel;
