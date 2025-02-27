import React, {useState} from 'react'

function Login() {
    const [form, setForm] = useState({"email":"", "password":""})
    const [red, setRed] = useState("")
    let changeForm = (e)=>{
        setForm({...form, [e.target.name]:e.target.value})
    }

    const validateForm = (formData) => {
      const emptyFields = Object.keys(formData).filter(
        (key) => !formData[key].trim()
      );
  
      if (emptyFields.length > 0) {
        return { valid: false, emptyFields };
      }
      return { valid: true, emptyFields: [] };
    };

    let signin = async()=>{
      let result = validateForm(form);
    if (!result.valid) {
      setRed(result.emptyFields[0]);
      return 0;
    }
      try{
        let response = await fetch(`${import.meta.env.VITE_API_URL}/login`,{
          method:"POST",
          headers:{
            "Content-type":"application/json"
          },
          body:JSON.stringify(form)
        })
        if(response.ok){
          let json = await response.json()
          localStorage.setItem("user", JSON.stringify({"token":json.token, "id":json.id}))
          window.location.pathname = "/"
        }else{
          let json = await response.json()
          setRed(json.status)
        }
      }catch(e){
        console.log(e)
      }
    }

    let inputStyle = " p-2 border rounded w-[35%] m-auto mb-5 text-white outline-none "

  return (
    <div className=" flex flex-col m-auto mt-40 h-[40%] border border-white rounded-lg w-[40%] ">
      <h1 className=" text-4xl m-auto mt-5 mb-5 text-white ">Login</h1>
      <input value={form['email']} className={inputStyle+`${red=="all" || red=="email" ? "border-red-500" : ""}`} type="email" name="email" placeholder="Email" onChange={changeForm} />
      <p className={` text-red-500 m-auto mb-1 ${red=="all" || red=="email"?"border-red-500 block":"hidden"} `}>Enter valid email</p>
      <input value={form['password']} className={inputStyle + `${red=="all" || red=="password" ? "border-red-500" : ""}`} type="password" name="password" placeholder="Password" onChange={changeForm} />
      <p className={` text-red-500 m-auto mb-1 ${red=="all" || red=="password" ? "border-red-500 block":"hidden"} `}>Enter valid password</p>
      <button onClick={signin} className=" p-1 border rounded w-[15%] m-auto mt-2 mb-10 text-white text-base cursor-pointer hover:bg-[#999999] hover:text-black ">Submit</button>
      <a href="/enter-email" className=" decoration-none text-white m-auto mb-5 ">Forgot Password?</a>
    </div>
  )
}

export default Login
