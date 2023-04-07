import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const prompt = req.body.animal || '';
  // if (prompt.trim().length === 0) {
  //   res.status(400).json({
  //     error: {
  //       message: "Please enter a valid prompt",
  //     }
  //   });
  //   return;
  // }

  try {

   var searchResult = searchData(prompt)
   searchResult.then((res) => { 

      var searchResultString = handleSearchData(res.data);
      //console.log('searchResultString -->' + searchResultString);

      openai.createCompletion({
          model: "text-davinci-003",
          max_tokens: 200,
          prompt: generatePrompt(prompt, searchResultString)

        }).then((completion) => { 
          
          console.log('completion -->' +JSON.stringify(completion.data.choices[0].text));

          //res.status(200).send( completion.data.choices[0].text);

        });



    }).catch((err) => {
        console.error(err.message);
    });


  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }

}



function generatePrompt(prompt, dataset) {

  return `You are a financial advisor bot
  You do not reply to anything not related to banking

  Your dataset is below

  ${dataset}
  Answer the question below based on the above dataset:
  ${prompt}

`;




}

function searchData( SearchText){

const axios = require('axios');
const headers= {
    'Content-Type': 'application/json'
  };

  const params= {
    'api-version': '2021-04-30-Preview',
    'api-key': 'PvWkLSE87jQ6FGRMhFpYJoASrCskkVPpPulqEkwAOWAzSeBYBWhU'
  };



const data = {
  'search': SearchText,
  'queryType': 'semantic',
  'queryLanguage': 'en-us',
  'semanticConfiguration': 'semanticcb',
  'answers': 'extractive|count-3',
  'captions': 'extractive|highlight-true',
  'count': 'true'
};

return axios.post('https://searchcbus.search.windows.net/indexes/azureblob-index/docs/search?api-version=2021-04-30-Preview&api-key=PvWkLSE87jQ6FGRMhFpYJoASrCskkVPpPulqEkwAOWAzSeBYBWhU', data);
    // .then((res) => {

    //  return handleSearchData(res.data);
    //     // console.log(`Status: ${res.status}`);
    //      console.log(' Search data --> Body: ', res.data);
    // }).catch((err) => {
    //     console.error(err.message);
    // });
}

function handleSearchData(searchData){
  var jsonSearchData = JSON.parse(JSON.stringify(searchData));
  var searchString="";

  for (const item of jsonSearchData.value) {
    const captions = item['@search.captions'];
    const organizations = item['organizations'];
    searchString += findOrganisation(organizations) + captions[0].text + '\n';
  }
 // console.log("handleSearchData-->" + searchString);
  return searchString;
}

  function findOrganisation(org){
    if(org.includes('Mauritius Commercial Bank Ltd')) return 'Mauritius Commercial Bank Ltd :'
    if(org.includes('SBM')) return 'State Bank of Mauritius Ltd :'
    if(org.includes('ABC')) return 'ABC Banking :'
    if(org.includes('AFRASIA BANK LIMITED')) return 'AFRASIA BANK LIMITED :'
  }

