const https=require('https')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const app=require('express')()
const bodyParser=require('body-parser')
app.use(bodyParser.json())
const getData=path=>{
    const options={
        path,
        hostname:'api.github.com',
        headers:{'User-Agent':path},
        //port:8080,
        //headers:{[headerKey]:getHeader},
        //body:req.body,
        method:'GET',
        //rejectUnauthorized: false,
    }
    console.log(options)
    let result=''
    return new Promise((resolve, reject)=>{
        const serverRequest=https.request(options, serverResult=>{
            serverResult.on('data', d => {
                result+=d
            })
            serverResult.on('end', ()=>{
                resolve(JSON.parse(result))
            })
        })
        serverRequest.on('error', err=>{
            reject(err)
        })
        serverRequest.end()
    })
    
}

const getTimeArray=(minDate, aggregation)=>{
    let timeArray=[minDate]
    const currTime=(new Date()).getTime()
    while(timeArray[timeArray.length-1]<currTime){
        timeArray.push(timeArray[timeArray.length-1]+aggregation)
    }
    return timeArray
}
const convertStringToMS=dateStr=>(new Date(dateStr)).getTime()
const getTimeInMSFromIndex=(minDate, currDate, aggregation)=>minDate+Math.floor((currDate-minDate)/aggregation)*aggregation
const getParamsFromReq=req=>{
    const {min_date, aggregation}=req.query
    const {owner, repo}=req.params
    return {
        owner,
        repo,
        minDate:convertStringToMS(min_date),
        min_date,
        aggregation:parseInt(aggregation, 10)
    }
}
app.get('/:owner/:repo/time_issues', (req, res)=>{
    const {owner, repo, aggregation, minDate, min_date}=getParamsFromReq(req)
    getData(`/repos/${owner}/${repo}/issues?state=closed&since=${min_date}`).then(result=>{
        return result.map(({created_at, closed_at})=>({
            aggregateIndex:getTimeInMSFromIndex(minDate, convertStringToMS(created_at), aggregation),
            timeTillClose: new Date(closed_at)-new Date(created_at)
        })).reduce((aggr, curr)=>({
            v:Object.assign({}, aggr.v, {[curr.aggregateIndex]:aggr.v[curr.aggregateIndex]||0+curr.timeTillClose}),
            n:Object.assign({}, aggr.n, {[curr.aggregateIndex]:aggr.n[curr.aggregateIndex]||0+1})
        }), {v:{}, n:{}})
    }).then(({v, n})=>{
        const times=getTimeArray(minDate, aggregation)
        const values=times.map(key=>v[key]?v[key]/n[key]:undefined)
        res.send({times, values})
    })
})

const getMSSinceBeginning=(minDate, aggregation)=>({created_at})=>getTimeInMSFromIndex(minDate, convertStringToMS(created_at), aggregation)
const getCount=(aggr, curr)=>Object.assign({}, aggr, {[curr]:(aggr[curr]||0)+1})
app.get('/:owner/:repo/issues', (req, res)=>{
    const {owner, repo, aggregation, minDate, min_date}=getParamsFromReq(req)
    getData(`/repos/${owner}/${repo}/issues?state=all&since=${min_date}`)
        .then(result=>result.map(getMSSinceBeginning(minDate, aggregation)))
        .then(result=>result.reduce(getCount, {}))
        .then(result=>{
            const times=getTimeArray(minDate, aggregation)
            const values=times.map(key=>result[key])
            res.send({times, values})
        })
})
app.get('/:owner/:repo/releases', (req, res)=>{
    const {owner, repo, aggregation, minDate, min_date}=getParamsFromReq(req)
    getData(`/repos/${owner}/${repo}/releases?since=${min_date}`)
        .then(result=>result.map(getMSSinceBeginning(minDate, aggregation)))
        .then(result=>result.reduce(getCount, {}))
        .then(result=>{
            const times=getTimeArray(minDate, aggregation)
            const values=times.map(key=>result[key])
            res.send({times, values})
        })
})
app.get('/:owner/:repo/commits', (req, res)=>{
    const {owner, repo, aggregation, minDate, min_date}=getParamsFromReq(req)
    getData(`/repos/${owner}/${repo}/commits?since=${min_date}`)
        .then(result=>result.map(({commit})=>getTimeInMSFromIndex(minDate, convertStringToMS(commit.committer.date), aggregation)))
        .then(result=>result.reduce(getCount, {}))
        .then(result=>{
            const times=getTimeArray(minDate, aggregation)
            const values=times.map(key=>result[key])
            res.send({times, values})
        })
})
//1 week=604800000 ms
//http://localhost:3000/phillyfan1138/levy-functions/issues?aggregation=604800000&min_date=2018-03-09T15:27:26Z
app.listen(3000, () => console.log('Example app listening on port 3000!'))