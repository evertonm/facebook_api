const bizSdk = require('facebook-nodejs-business-sdk');
const AdAccount = bizSdk.AdAccount;
const moment = require('moment');
const fs = require('fs');
const {addMonths, differenceInCalendarDays, format} = require('date-fns');
//Criar logica para obter token de longa duração a cada 30 dias
/*
URL:
  https://graph.facebook.com/v11.0/oauth/access_token?grant_type=fb_exchange_token&client_id=154090190123813&client_secret=b3bff8a6de920ab13982ad66382958ff&fb_exchange_token=EAACMJOsLsyUBAGUBO1wsaEqh1ZCqOeiZCZBugB9WH3yBcITMGpEOWfwfQXgLZBj3jqL11EOM7pBCCCayuh1a7tqDpoZA1rRhJHmfZApAXHgFjyZCJ49wCZCqO07JDP3VHbeO87Tjpc1rVYwiXNl30ek7A6Xq5I6VtDIe3GDayIft7Jn78zcLWq3WRF2fnfZBhy2TGSvjs4N7MQsp3XtivoreEUEVkgWaEBSbMp04Dyzea1q276V97boEZB
*/

//Criar automação para armazenar dia após dia desde 2021-07-01
//Verificar se tem campo, se não tiver no retorno, inserir no objeto como nulo
//Definir estados e ids ([id, description])

//variar token
let access_token = 'EAACMJOsLsyUBAIVJab56kjzn7oHVtTXhPYOZApajHpFzkKoquAfkgKxxUlF2TZCmXSVkq5HPqUR65sX7c8wvPKVVATHi57MgHXZBfRZAZBHe2HC5awZB1w6ZA4mRXbwpKU3i1eV587mOBcL3ZAFCePTvXHU1ZB82cYDwZBEKaFMXX71QZDZD';
let ad_account_id = 'act_1975449945940491';
const api = bizSdk.FacebookAdsApi.init(access_token);
const showDebugingInfo = true; //Setting this to true shows more debugging info.

if (showDebugingInfo) {
  api.setDebug(true);
}
/* Lê o arquivo e separa as variaveis de data e access token */
fs.readFile('./access_token.json', function(err, data) {
  if(err) throw err;
  const {data_geracao, access_token} = JSON.parse(data);
  console.log(data_geracao);

});

//Transformar data_geracao em Date
//verificar se a data_geracao + 1 mes é maior q o dia atual
//Se sim, buscar o token, se nao usar o access_token

const dia_atual = new Date();
const dia_atual_formatado = format(dia_atual, 'yyyy-MM-dd')
console.log(dia_atual_formatado);

const arquivo = {
  data_geracao: '2022-03-20',
  access_token: 'EAACMJOsLsyUBAIVJab56kjzn7oHVtTXhPYOZApajHpFzkKoquAfkgKxxUlF2TZCmXSVkq5HPqUR65sX7c8wvPKVVATHi57MgHXZBfRZAZBHe2HC5awZB1w6ZA4mRXbwpKU3i1eV587mOBcL3ZAFCePTvXHU1ZB82cYDwZBEKaFMXX71QZDZD'
}

fs.writeFile('./access_token.json', JSON.stringify(arquivo), function (err) {
  if (err) throw err;
  console.log('Arquivo gerado !');
});


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
  'time_range': { 'since': '2021-07-01', 'until': '2021-07-30' },
};

new AdAccount(ad_account_id).getInsights(
  fields,
  params
).then((response) => {
  response.forEach((obj) => {
    console.log(obj._data)
  });
});

//Sample usage momentjs
const date = moment().format();
console.log(date);

writeFile('nomura');

function writeFile(client) {

  const path = `${client}.json`;
  let dateStart = '2021-07-01';
  let dataToInsert;
  fs.access(path, fs.F_OK, (err) => {
    if (err) { //Arquivo não existe
      console.log('não existe');

      //Criar lógica para pegar da data: 2021-07-01 até hoje

      dataToInsert = [];

      dataToInsert.push({
        id: dataToInsert.length + 1,
        date_start: '2021-07-03'
      })


    } else {
      const fileData = JSON.parse(fs.readFileSync(path));

      if (fileData[fileData.length - 1].date_start) {
        dateStart = fileData[fileData.length - 1].date_start;
      }
      dataToInsert = fileData;   
      
      dataToInsert.push({
        id: dataToInsert.length + 1,
        date_start: '2021-07-04'
      })
    
      //Criar lógica para pegar da última data inserida até hoje

    }


    //inserir dado no json
    if(dataToInsert) {
      fs.writeFile(path, JSON.stringify(dataToInsert), function (err) {
        if (err) throw err;
        console.log('Thanks, It\'s saved to the file!');
      });
    }

  })
}

