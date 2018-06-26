const http=require('http')
http.get('http://localhost:3000/phillyfan1138/levy-functions/commits?aggregation=604800000&min_date=2018-03-09T15:27:26Z', res=>{
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        console.log(rawData)
    })
})