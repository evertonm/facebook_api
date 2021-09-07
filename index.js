const bizSdk = require('facebook-nodejs-business-sdk');
const moment = require('moment');
const fs = require('fs');
const {format} = require('date-fns');
const axios = require('axios');
//Criar logica para obter token de longa duração a cada 30 dias
/*
URL:
  https://graph.facebook.com/v11.0/oauth/access_token?grant_type=fb_exchange_token&client_id=154090190123813&client_secret=b3bff8a6de920ab13982ad66382958ff&fb_exchange_token=EAACMJOsLsyUBAMT0nVzzTqzhyqVv605SGDLizpELNIIce9w5ktfF5oZAfMVLGXeoed4GZASfWaFbSFESeNeKBExuwhiZC0lbMrbe0XBZBsxBUA5ZCIM3XMpb8LSw5R3TGBHuNzDHwW9gT4CU0OtdMVuaR1Dtogbse14dIqQqN5l0Xt9X8YTX8jPwA4FnVZBJlc3o1YMiudZARwMKEWEh2wB
*/

//Criar automação para armazenar dia após dia desde 2021-07-01
//Verificar se tem campo, se não tiver no retorno, inserir no objeto como nulo
//Definir estados e ids ([id, description])

//variar token

/* Lê o arquivo e separa as variaveis de data e access token */

function retornaDataAtualizada(data_arquivo) {
  const data = new Date(data_arquivo);
  data.setMonth(data.getMonth() + 2);

  return data;
}

async function retornaNovoTokenAPI(token, client_id, client_secret) {
  const url = `https://graph.facebook.com/v11.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${client_id}&client_secret=${client_secret}&fb_exchange_token=${token}`;

  const response = await axios.get(url);
  const {access_token} = response.data

  return access_token;
}

async function retornaTokenArquivo(client) {
  const dados_arquivo = fs.readFileSync(`./${client}_token.json`, 'utf8',function(err, data) {
    if(err) throw err;
    return data;
  
  });

  const {act_id, id_pagina, client_id, client_secret, data_geracao, access_token} = JSON.parse(dados_arquivo);
  const data_arquivo_atualizada = retornaDataAtualizada(data_geracao); 
  const dia_atual = new Date();
  let token = null;

  if (data_arquivo_atualizada.valueOf() <= dia_atual.valueOf()) {
    
    token = await retornaNovoTokenAPI(access_token, client_id, client_secret);
    const dia_atual_formatado = format(dia_atual, 'yyyy-MM-dd')
    const novo_arquivo = {
      client: client,
      act_id: act_id,
      id_pagina: id_pagina,
      client_id,
      client_secret: client_secret,
      data_geracao: dia_atual_formatado,
      access_token: token
    }
    
    fs.writeFile(`./${client}_token.json`, JSON.stringify(novo_arquivo), function (err) {
      if (err) throw err;
      console.log('Arquivo gerado !');
    });
  } else {
    token = access_token;
  }
  
  return await token;
}


//Transformar data_geracao em Date
//verificar se a data_geracao + 1 mes é maior q o dia atual
//Se sim, buscar o token, se nao usar o access_token

// //Sample usage momentjs
const date = moment().format();
console.log(date);

writeFile('nomura');


function writeFile(client) {

  const path = `${client}.json`;
  let dateStart = '2021-06-30';
  let dataToInsert;
  fs.access(path, fs.F_OK, (err) => {
    if (err) { //Arquivo não existe
      //Criar lógica para pegar da data: 2021-07-01 até hoje
      dataToInsert = [];
    } else {
      const fileData = JSON.parse(fs.readFileSync(path));

      if (fileData[fileData.length - 1] && fileData[fileData.length - 1].date_start) {
        dateStart = fileData[fileData.length - 1].date_start;
      }
      dataToInsert = fileData;
    }

    const date = new Date(dateStart);
    date.setDate(date.getDate() + 2);
    date.setHours(0, 0, 0, 0);
    date.setMinutes(0);
    date.setSeconds(0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setMinutes(0);
    today.setSeconds(0);

    if (date < today) {
      getInfoAPI(path, date, today, dataToInsert, client);
    } else {
      console.log('Isso é tudo por hoje (:')
    }
  })
}

async function getInfoAPI(path, date, today, insertData, client) {
  //Variar por cliente/tempo
  let access_token = 'EAACMJOsLsyUBAFZCsWZBuFCEaV1jaulsNcCNT4Es5ts1mYqtLz25V7B1dHgQJnh8rlYeeDyDS4jxeQst42z6fJTkEMZATzUpD2J1e9YLndSDz4GU69g9TYNSw7Ix5RUwzfgkecDQSUOqejnE9PqGcgyoxijgQ3M92QTACrULQZDZD';
  let ad_account_id = 'act_1975449945940491';//Variar por cliente
  const fields =
    `campaign_id,account_id,account_name,account_currency,inline_link_clicks,impressions,clicks,spend,cpm,
  frequency,cpp,ctr,reach,cost_per_conversion,actions,action_values,location`;

  const monthFormatted = date.getMonth() + 1 < 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const dayFormatted = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  console.log('Gerando da data:')
  console.log(`${date.getFullYear()}-${monthFormatted}-${dayFormatted}`)
  const breakdowns = 'region';
  const time_range = JSON.stringify
    ({
      'since': `${date.getFullYear()}-${monthFormatted}-${dayFormatted}`,
      'until': `${date.getFullYear()}-${monthFormatted}-${dayFormatted}`
    });
  try {
    const res = await axios.get(
      `https://graph.facebook.com/v11.0/${ad_account_id}/insights?
      fields=${fields}
      &breakdowns=${breakdowns}
      &time_range=${time_range}
      &access_token=${access_token}`
    );

    insertData = insertData.concat(res.data.data);

    fs.writeFile(path, JSON.stringify(insertData), function (err) {
      if (err) throw err;
      if (date < today) {
        date.setDate(date.getDate() + 1);
        getInfoAPI(path, date, today, insertData, client);
      }
    });

    console.log(insertData.length);
  } catch (err) {
    console.log(err);
  }
}
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