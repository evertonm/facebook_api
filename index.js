const bizSdk = require('facebook-nodejs-business-sdk');
const AdAccount = bizSdk.AdAccount;
const moment = require('moment');
const fs = require('fs');
const {addMonths, differenceInCalendarDays, format} = require('date-fns');
//Criar logica para obter token de longa duração a cada 30 dias
/*
URL:
  https://graph.facebook.com/v11.0/oauth/access_token?grant_type=fb_exchange_token&client_id=154090190123813&client_secret=b3bff8a6de920ab13982ad66382958ff&fb_exchange_token=EAACMJOsLsyUBAMT0nVzzTqzhyqVv605SGDLizpELNIIce9w5ktfF5oZAfMVLGXeoed4GZASfWaFbSFESeNeKBExuwhiZC0lbMrbe0XBZBsxBUA5ZCIM3XMpb8LSw5R3TGBHuNzDHwW9gT4CU0OtdMVuaR1Dtogbse14dIqQqN5l0Xt9X8YTX8jPwA4FnVZBJlc3o1YMiudZARwMKEWEh2wB
*/

//Criar automação para armazenar dia após dia desde 2021-07-01
//Verificar se tem campo, se não tiver no retorno, inserir no objeto como nulo
//Definir estados e ids ([id, description])

//variar token

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

  const estados = [
    {
        "id": 1,
        "unidadeFederal": "Rio Grande do Sul",
        "sgUf": "RS"
    },
    {
        "id":2,
        "unidadeFederal":"Santa Catarina",
        "sgUf": "SC"
    },
    {
        "id":3,
        "unidadeFederal":"Amapá",
        "sgUf": "AP"
    },
    {
        "id":4,
        "unidadeFederal":"Espírito Santo",
        "sgUf": "ES"
    },
    {
        "id":5,
        "unidadeFederal":"Mato Grosso",
        "sgUf": "MT"
    },
    {
        "id":6,
        "unidadeFederal":"Piauí",
        "sgUf": "PI"
    },
    {
        "id":7,
        "unidadeFederal":"Sergipe",
        "sgUf": "SE"
    },
    {
        "id":8,
        "unidadeFederal":"Paraná",
        "sgUf": "PR"
    },
    {
        "id":9,
        "unidadeFederal":"Brasília",
        "sgUf": "DF"
    },
    {
        "id":10,
        "unidadeFederal":"Amazonas",
        "sgUf": "AM"
    },
    {
        "id":11,
        "unidadeFederal":"Ceará",
        "sgUf": "CE"
    },
    {
        "id":12,
        "unidadeFederal":"Mato Grosso do Sul",
        "sgUf": "MS"
    },
    {
        "id":13,
        "unidadeFederal":"Pernambuco",
        "sgUf": "PE"
    },
    {
        "id":14,
        "unidadeFederal":"Roraima",
        "sgUf": "RR"
    },
    {
        "id":15,
        "unidadeFederal":"São Paulo",
        "sgUf": "SP"
    },
    {
        "id":16,
        "unidadeFederal":"Minas Gerais",
        "sgUf": "MG"
    },
    {
        "id":17,
        "unidadeFederal":"Alagoas",
        "sgUf": "AL"
    },
    {
        "id":18,
        "unidadeFederal":"Bahia",
        "sgUf": "BA"
    },
    {
        "id":19,
        "unidadeFederal":"Maranhão",
        "sgUf": "MA"
    },
    {
        "id":20,
        "unidadeFederal":"Paraíba",
        "sgUf": "PB"
    },
    {
        "id":21,
        "unidadeFederal":"Rondônia",
        "sgUf": "RO"
    },
    {
        "id":22,
        "unidadeFederal":"Rio de Janeiro",
        "sgUf": "RJ"
    },
    {
        "id":23,
        "unidadeFederal":"Acre",
        "sgUf": "AC"
    },
    {
        "id":24,
        "unidadeFederal":"Goiás",
        "sgUf": "GO"
    },
    {
        "id":25,
        "unidadeFederal":"Pará",
        "sgUf": "PA"
    },
    {
        "id":26,
        "unidadeFederal":"Rio Grande do Norte",
        "sgUf": "RN"
    },
    {
        "id":27,
        "unidadeFederal":"Tocantins",
        "sgUf": "TO"
    }
  ];
  
}