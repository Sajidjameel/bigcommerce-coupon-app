type methods = 'GET' | "POST" | "PUT" | "DELETE"

export const ApiFetchReq = async (url: string, {methods, body}:{methods: methods, body?: any}) => {
  const token = localStorage.getItem('storehash');
 
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": 'application/json',
  };

  try{
    const response = await fetch(url, {
      method: methods,
      headers: headers,
      body: body
    })

    return {response, error: null}
  }catch(er){
    return {response: null, error: er}
  }
};