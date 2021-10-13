const moment = require('moment');
const fs = require('fs');
const {format} = require('date-fns');
const axios = require('axios');

function retornaDataAtualizada(data_arquivo) {
  const data = new Date(data_arquivo);
  data.setMonth(data.getMonth() + 2);

  return data;
}

async function retornaNovoTokenAPI(token, client_id, client_secret) {
  const url = `https://graph.facebook.com/v11.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${client_id}&client_secret=${client_secret}&fb_exchange_token=${token}`;
  try {
    const response = await axios.get(url);
    const {access_token} = response.data
  
    return access_token;
  } catch(err) {
    console.log(err);
  }
  
}

async function retornaTokenArquivo(client) {
  const dados_arquivo = fs.readFileSync(`./${client}_token.json`, 'utf8',function(err, data) {
    if(err) throw err;
    return data;
  
  });

  let {act_id, id_pagina, client_id, client_secret, data_geracao, access_token, page_token} = JSON.parse(dados_arquivo);

  const data_arquivo_atualizada = retornaDataAtualizada(data_geracao); 
  const dia_atual = new Date();
  let responseClient = null;

  if (data_arquivo_atualizada.valueOf() <= dia_atual.valueOf()) {
    
    const token = await retornaNovoTokenAPI(access_token, client_id, client_secret);
    
    if(!page_token) {
      try {
        page_token = await axios.get(
          `https://graph.facebook.com/${id_pagina}?fields=access_token&access_token=${access_token}`
        );


      } catch(err) {
        console.log(err);
      }
    }
    const dia_atual_formatado = format(dia_atual, 'yyyy-MM-dd')
    const novo_arquivo = {
      client: client,
      act_id: act_id,
      id_pagina: id_pagina,
      client_id,
      client_secret: client_secret,
      data_geracao: dia_atual_formatado,
      access_token: token,
      page_token: page_token.data.access_token 
    }
    
    responseClient = novo_arquivo;
    
    fs.writeFile(`./${client}_token.json`, JSON.stringify(novo_arquivo), function (err) {
      if (err) throw err;
      console.log('Arquivo gerado !');
    });
  } else {
    responseClient = {act_id, id_pagina, client_id, client_secret, data_geracao, access_token, page_token};
  }
  
  return await responseClient;
}

const clientsName = [
  'nomura',
  'arezzo',
  'schutz'
]

clientsName.forEach((clientName) => {
  retornaTokenArquivo(clientName).then((response) => {
    const clientInfo = response;
    //writeFileInfoPage(clientName, clientInfo)
    writeFile(clientName, clientInfo);
  });  
});
 

async function writeFileInfoPage(client, clientInfo) {
  const path = `${client}_info_page.json`;
  let dataToInsert;

  fs.access(path, fs.F_OK, async (err) => {
    if(err) { //Arquivo não existe
      dataToInsert = [];
    } else {
      const fileData = JSON.parse(fs.readFileSync(path));
      dataToInsert = fileData;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      today.setMinutes(0);
      today.setSeconds(0);
      const monthFormatted = today.getMonth() + 1 < 9 ? `0${today.getMonth() + 1}` : today.getMonth() + 1;
      const dayFormatted = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate();
      const objectToJson = {
        generated_date: `${today.getFullYear()}-${monthFormatted}-${dayFormatted}`,
        pageViewTotal: {},
        pagePostEngagement: {}
      };
      const responsePageViewTotal = await axios.get(
        `https://graph.facebook.com/v11.0/${clientInfo.id_pagina}/insights/page_views_total`,
        { headers: {"Authorization" : `Bearer ${clientInfo.page_token}`} }
      );
  
      const pageViewTotal = responsePageViewTotal.data.data;
      objectToJson.pageViewTotal = pageViewTotal;


      const responsePagePostEngagement = await axios.get(
        `https://graph.facebook.com/v11.0/${clientInfo.id_pagina}/insights/page_post_engagements`,
        { headers: {"Authorization" : `Bearer ${clientInfo.page_token}`} }
      );

      const pagePostEngagement = responsePagePostEngagement.data.data;
      objectToJson.pagePostEngagement = pagePostEngagement;
      
      dataToInsert = dataToInsert.concat(objectToJson);
      fs.writeFile(path, JSON.stringify(dataToInsert), function (err) {
        if (err) throw err;
        console.log('Arquivo de informações da página criado com sucesso!');
      });

    } catch(err) {
      console.log(err);
    }

    //https://graph.facebook.com/v11.0/1475560419377632/insights/page_views_total
  });

} 

function writeFile(client, clientInfo) {

  const path = `${client}.json`;
  let dateStart = '2021-07-01';
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
      getInfoAPI(path, date, today, dataToInsert, client, clientInfo);
    } else {
      console.log('Isso é tudo por hoje (:')
    }
  })
}

async function getInfoAPI(path, date, today, insertData, client, clientInfo) {

  try {
    let access_token = clientInfo.access_token;
    let ad_account_id = clientInfo.act_id;

    const campaigns = await axios.get(
      `https://graph.facebook.com/v11.0/${ad_account_id}/campaigns?limit=1000000&fields=name,level&access_token=${access_token}`
    );

    const fields =
      `purchase_roas,website_ctr,campaign_id,campaign_name,video_thruplay_watched_actions,account_id,account_name,cost_per_thruplay,account_currency,conversions,inline_link_clicks,video_p50_watched_actions,impressions,video_p75_watched_actions,video_p95_watched_actions,clicks,website_purchase_roas,spend,cpm, frequency,cpp,ctr,reach,cost_per_conversion,actions,action_values,location, video_avg_time_watched_actions`;

    const monthFormatted = date.getMonth() + 1 < 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const dayFormatted = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    console.log(`Obtendo informações do cliente ${client}, na data: ${date.getFullYear()}-${monthFormatted}-${dayFormatted}`)

    const time_range = JSON.stringify
      ({
        'since': `${date.getFullYear()}-${monthFormatted}-${dayFormatted}`,
        'until': `${date.getFullYear()}-${monthFormatted}-${dayFormatted}`
      });

    const campaignsPromises = [];
    campaigns.data.data.forEach((campaign) => {
      console.log(campaign)
      const url = `https://graph.facebook.com/v11.0/${campaign.id}/insights?action_attribution_windows=['1d_click','1d_view']&fields=${fields}&time_range=${time_range}&access_token=${access_token}`;
      campaignsPromises.push(axios.get(
        url
      ));
    });


    const responseCampaigns = await Promise.all(campaignsPromises);
    const campaignsToJson = [];
    responseCampaigns.forEach((responseCampaign) => {

      if (responseCampaign.data.data.length > 0) {

        const campaign = responseCampaign.data.data[0];

        //Facilitar processo de ETL, deixar propriedades com nome único 
        if(campaign.actions) {

          campaign.actions.forEach((action, index) => {
            if(campaign.action_values) {
              campaign.action_values.forEach((action_value) => {
                
                // Deixar valor e quantidade no mesmo objeto
                if(action_value.action_type === action.action_type) {
                  action[`value_${index + 1}`] = action_value.value;

                  if(action_value['1d_click']) {
                    action[`value_${index + 1}`] = action_value['1d_click'];
                  }
                }
              })
            }
            action[`action_type_${index + 1}`] = action.action_type;
            action[`quantity_${index + 1}`] = action.value;
            if(action['1d_click']) {
              action[`quantity_${index + 1}`] = action['1d_click'];
            }
            delete action['action_type'];
            delete action['value'];
          });
  
          delete campaign['action_values'];
        }

        campaign.originalName = campaign.campaign_name;
        campaign.campaign_name = campaign.campaign_name.split(/\s/).join('');

        const indexOfBracket = campaign.campaign_name.indexOf(']');
        const stateInCampaignName = campaign.campaign_name.substring(indexOfBracket - 2, indexOfBracket);
        estados.forEach((estado) => {
          if (estado.sgUf === stateInCampaignName) {
            campaign.state = estado;
          }
        })
        campaignsToJson.push(campaign);
      }
    });

    insertData = insertData.concat(campaignsToJson);

    fs.writeFile(path, JSON.stringify(insertData), function (err) {
      if (err) throw err;
      if (date < today) {
        date.setDate(date.getDate() + 1);
        getInfoAPI(path, date, today, insertData, client, clientInfo);
      }
    });

  } catch (err) {
    //console.log(err);
    const monthFormatted = date.getMonth() + 1 < 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const dayFormatted = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    console.log(`**************************\nOh, noh! Too many requests :( .Trying again in 30 seconds, please wait :)\n${err}\nInfo Query: \nDate: ${date.getFullYear()}-${monthFormatted}-${dayFormatted}\nClient: ${client}\n**************************`)
    setTimeout(() => {
      writeFile(client, clientInfo);
    }, 30000)

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