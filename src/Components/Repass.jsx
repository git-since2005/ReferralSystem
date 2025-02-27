import React, {useState, useEffect} from 'react'

function Repass() {
    const [pass, setPass] = useState({"re":"", "password":""})
    useEffect(()=>{
        let params = new URLSearchParams(window.location.search)
        let token = params.get("token")
        console.log(token)
        let verifyParam = async()=>{
          if(token){
            let response = await fetch(`${import.meta.env.VITE_API_URL}/verify`,{
              method:"POST",
              headers:{
                "Content-type":"application/json"
              },
              body:JSON.stringify({
                token: token
              })
            })
            console.log(response)
            if(!response.ok){
              alert("Link is broken")
              window.location.pathname = "/"
            }else{
                let json = await response.json()
              setPass({...pass, "email":json.email})
            }
          }
        }
        verifyParam()
      }, [])

      let submit = async()=>{
        let response = await fetch(`${import.meta.env.VITE_API_URL}/reset-password`, {
            method:"POST",
            headers:{
                "Content-type":"application/json"
            },
            body:JSON.stringify(pass)
        })
        if(response.ok){
            window.location.pathname = "/login"
        }
        else{
            alert("Link might be broken.")
        }
      }

      let inputStyle = ` ${pass['re']!=pass['password']?"border-red-500":"border-white"} border text-white mt-5 rounded m-auto outline-none p-2 w-[30%] `
  return (
    <div className=" m-auto flex flex-col w-[40%] mt-50 h-[45%] border border-white rounded ">
        <h1 className=" text-white text-5xl m-auto ">Reset Password</h1>
      <input className={inputStyle} value = {pass['password']} onChange={(e)=>{setPass({...pass, [e.target.name]:e.target.value})}} type="password" name="password" placeholder="New Password" />
      <input className={inputStyle} value = {pass['re']} onChange={(e)=>{setPass({...pass, [e.target.name]:e.target.value})}} type="password" name="re" placeholder="Re-type Password" />
      <button onClick={submit} className=" border border-white rounded w-[15%] m-auto mb-5 mt-7 p-2 hover:bg-white hover:text-white bg-black text-white ">Submit</button>
    </div>
  )
}

export default Repass
