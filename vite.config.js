import {defineConfig} from 'vite';
import {formatWithModel, listModels} from './server/patternAI.js';

export default defineConfig({plugins:[{
  name:'local-pattern-ai',
  configureServer(server){
    server.middlewares.use('/api/pattern-ai',async(req,res)=>{
      res.setHeader('Content-Type','application/json');
      res.setHeader('Cache-Control','no-store');
      try {
        if(req.method==='GET'){res.end(JSON.stringify({models:await listModels()}));return;}
        if(req.method!=='POST'){res.statusCode=405;res.end(JSON.stringify({error:'Method not allowed'}));return;}
        let body='';for await(const chunk of req){body+=chunk;if(body.length>24000){res.statusCode=413;res.end(JSON.stringify({error:'Pattern is too long. Paste at most 20,000 characters.'}));return;}}
        const {source,model}=JSON.parse(body);
        const result=await formatWithModel(source,model);
        res.end(JSON.stringify(result));
      }catch(error){res.statusCode=400;res.end(JSON.stringify({error:error.message}));}
    });
  },
}]});
