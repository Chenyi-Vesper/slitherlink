import {generate} from './engine';
self.onmessage=e=>{try{self.postMessage({clues:generate(e.data)})}catch{self.postMessage({error:'生成暂未成功，请重试。'})}};
