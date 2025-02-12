const urlBase = 'https://dummy/'

export async function callBackend(url,method,params,body){


    const urlFull = urlBase + url

    let globalHeaders  = {}

    if (body) {
        globalHeaders['Content-Type'] = 'application/json'
    }
    globalHeaders['Authorization'] = `Bearer ${localStorage.getItem('token')}`

    let urlObj = new URL(urlFull)

    if (params) {
        Object.keys(params).forEach(key => urlObj.searchParams.append(key, params[key]))
    }

    const response = await fetch(`/${url}`, {
        method: method,
        headers: globalHeaders,
        credentials:'same-origin',
        body: body && JSON.stringify(body),
    })

    if (response.status >= 400) {
        let returnError = {}
        returnError.code = response.status
        returnError.message = await response.json().
        then(err=>err.detail).catch(ex => console.log(ex))

        throw returnError
    }

    try {
        const json = await response.json()
        if(json['access_token']){
            localStorage.setItem('token',json['access_token'])
        }
        return json.data
    }
    catch (ex) {
        
        console.error(ex)
        throw ex
    }   

}