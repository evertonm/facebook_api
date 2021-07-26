const bizSdk = require('facebook-nodejs-business-sdk');
const AdAccount = bizSdk.AdAccount;
const moment = require('moment');
//Criar logica para obter token de longa duração a cada 30 dias
/*
URL:
  https://graph.facebook.com/v11.0/oauth/access_token?grant_type=fb_exchange_token&client_id=154090190123813&client_secret=b3bff8a6de920ab13982ad66382958ff&fb_exchange_token=EAACMJOsLsyUBAPU4R9h6ljRfFSgxrsVl5ZAv7HRYgTgZAjx2kKI2ZCPW3Sii7UEdovNaj2cQT9sIJ0dpWwz6Pz5IY14JVrbZC2x9mGaD2OPtcwsqZA5vDtd0HUZCZCg6iroqkfpP90CX8DdLUxZA7tZAjXY2URz8mZA3I1ZAGDrS1ActwZDZD
*/

//Criar automação para armazenar dia após dia desde 2021-07-01
//Verificar se tem campo, se não tiver no retorno, inserir no objeto como nulo
//Definir estados e ids ([id, description])

//variar token
let access_token = 'EAACMJOsLsyUBAPU4R9h6ljRfFSgxrsVl5ZAv7HRYgTgZAjx2kKI2ZCPW3Sii7UEdovNaj2cQT9sIJ0dpWwz6Pz5IY14JVrbZC2x9mGaD2OPtcwsqZA5vDtd0HUZCZCg6iroqkfpP90CX8DdLUxZA7tZAjXY2URz8mZA3I1ZAGDrS1ActwZDZD';
let ad_account_id = 'act_1975449945940491';
const api = bizSdk.FacebookAdsApi.init(access_token);
const showDebugingInfo = true; //Setting this to true shows more debugging info.

if (showDebugingInfo) {
  api.setDebug(true);
}


const fields = [
  'campaign_id',
  'account_id',
  'account_name',
  'account_currency',
  'inline_link_clicks',
  'impressions',
  'clicks',
  'spend',
  'cpm',
  'frequency',
  'cpp',
  'ctr',
  'reach',
  'cost_per_conversion',
  'actions',
  'action_values',
  'location'
];

const params = {
  'breakdowns': 'region',
  'time_range' : {'since':'2021-07-01','until':'2021-07-30'},
};

new AdAccount(ad_account_id).getInsights(
  fields,
  params
).then((response ) => {
  response.forEach((obj) => {
    console.log(obj._data)
  });
});

//Sample usage momentjs
const date = moment().format();
console.log(date);





