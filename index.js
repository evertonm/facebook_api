const bizSdk = require('facebook-nodejs-business-sdk');
const AdAccount = bizSdk.AdAccount;
const moment = require('moment');
const fs = require('fs');
//Criar logica para obter token de longa duração a cada 30 dias
/*
URL:
  https://graph.facebook.com/v11.0/oauth/access_token?grant_type=fb_exchange_token&client_id=154090190123813&client_secret=b3bff8a6de920ab13982ad66382958ff&fb_exchange_token=EAACMJOsLsyUBAMT0nVzzTqzhyqVv605SGDLizpELNIIce9w5ktfF5oZAfMVLGXeoed4GZASfWaFbSFESeNeKBExuwhiZC0lbMrbe0XBZBsxBUA5ZCIM3XMpb8LSw5R3TGBHuNzDHwW9gT4CU0OtdMVuaR1Dtogbse14dIqQqN5l0Xt9X8YTX8jPwA4FnVZBJlc3o1YMiudZARwMKEWEh2wB
*/

//Criar automação para armazenar dia após dia desde 2021-07-01
//Verificar se tem campo, se não tiver no retorno, inserir no objeto como nulo
//Definir estados e ids ([id, description])

//variar token





//Sample usage momentjs
const date = moment().format();
console.log(date);

writeFile('nomura');

function writeFile(client) {

  const path = `${client}.json`;
  let dateStart = '2021-07-20';
  let dataToInsert;
  fs.access(path, fs.F_OK, (err) => {
    if (err) { //Arquivo não existe
      //Criar lógica para pegar da data: 2021-07-01 até hoje
      dataToInsert = [];
    } else {
      const fileData = JSON.parse(fs.readFileSync(path));

      if (fileData[fileData.length - 1].date_start) {
        dateStart = fileData[fileData.length - 1].date_start;
      }
      dataToInsert = fileData;
    }

    const date = new Date(dateStart);
    date.setDate(date.getDate() + 1); //próximo a ser criado
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);    

    const today = new Date();
    today.setDate(today.getDate() + 1); //hoje
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);    

    console.log(date)
    console.log(today)
    console.log("TESTE ERBITO")

    if(date < today) {
      getInfoAPI(date);
    }


    //inserir dado no json
    /* if(dataToInsert) {
      fs.writeFile(path, JSON.stringify(dataToInsert), function (err) {
        if (err) throw err;
       
      });
    } */

  })
}

function getInfoAPI(date) {
  let access_token = 'EAACMJOsLsyUBAG7SDYrrFOpTb6TubvqXZAOMMQMpF6c4j5kxs36WMygG6LCsJMdyG9RCQaUPh6AePg4U9vf2BsZCysQdunlnD3GCWMj02NYZAqRFZBPQ6mlT9qagpta4R7ZCOQf8sqGFZBVOLqoql5l3lWaqtsHUxPazzxHnBSUAZDZD';
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
  const monthFormatted = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const dayFormatted = date.getDate() < 10 ? `0${date.getDate() + 1}` : date.getDate();
  const params = {
    'breakdowns': 'region',
    'time_range': { 'since': `${date.getFullYear()}-${monthFormatted}-${dayFormatted}`, 'until': `${date.getFullYear()}-${monthFormatted}-${dayFormatted}` },
  };

  console.log(params)
  
  
  new AdAccount(ad_account_id).getInsights(
    fields,
    params
  ).then((response) => {
    response.forEach((obj) => {
      console.log(obj._data)
    });
  });
  
}