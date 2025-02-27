import React, {useState} from 'react'

function Email() {
    const [email, setEmail] = useState("")
    const [red, setRed] = useState("")

    let submit = async()=>{
        let response = await fetch(`${import.meta.env.VITE_API_URL}/forgot-password`,{
            method:"POST",
            headers:{
                "Content-type":"application/json"
            },
            body:JSON.stringify({"email":email})
        })
        if(!response.ok){
            alert("Enter valid email")
            setRed("email")
        }else{
            alert("Check your inbox for verification link")
        }
    }
  return (
    <div className=" flex flex-col m-auto mt-50 h-[50%] border border-white rounded-lg w-[40%] ">
        <h1 className=" text-5xl m-auto text-white mt-5 ">Enter your email</h1>
        <input type="email" className= {` p-2 ${ red=="email" ? "border-red-500":""} outline-none text-white border-1 mt-5 mb-5 rounded w-[35%] m-auto`} value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
        <p className={" text-red-500 mt-2 m-auto "+`${red=="email"?"block":"hidden"}`}>Enter valid email</p>
        <button onClick={submit} className=" border rounded bg-black text-white hover:bg-[#999999] hover:text-white w-[15%] m-auto mb-5 ">Submit</button>
    </div>
  )
}

export default Email
