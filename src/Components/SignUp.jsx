import React, { useState, useEffect } from "react";

function SignUp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    re: "",
  });
  const [red, setRed] = useState("");
  let changeForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(()=>{
    let params = new URLSearchParams(window.location.search)
    let referral = params.get("referral")
    let verifyParam = async()=>{
      if(referral){
        let response = await fetch(`${import.meta.env.VITE_API_URL}/verify-link`,{
          method:"POST",
          headers:{
            "Content-type":"application/json"
          },
          body:JSON.stringify({
            code: referral
          })
        })
        if(!response.ok){
          alert("Link is broken")
          window.location = window.location.toString().split("?")[0]
        }else{
          alert(params.get("referral"))
          setForm({...form, "referral_code":params.get("referral")})
        }
      }
    }
    verifyParam()
  }, [])

  const validateForm = (formData) => {
    const emptyFields = Object.keys(formData).filter(
      (key) => !formData[key].trim()
    );

    if (emptyFields.length > 0) {
      return { valid: false, emptyFields };
    }
    return { valid: true, emptyFields: [] };
  };

  let submit = async () => {
    let result = validateForm(form);
    if (!result.valid) {
      setRed(result.emptyFields[0]);
    }
    try {
        setRed("")
      let response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        window.location.pathname = "login";
      }else{
        let json = await response.json()
        setRed(json.status)
      }
      console.log(response)
    } catch (e) {
      console.log(e);
    }
  };

  let inputStyle =
    " p-2 border rounded w-[35%] m-auto mb-4 text-white outline-none ";
    let warnStyle= ` text-red-500 m-auto mb-1 ${red=="all" || red} `

  return (
    <div className=" flex flex-col m-auto mt-35 h-[40%] border border-white rounded-lg w-[40%] ">
      <h1 className=" text-4xl m-auto mt-5 mb-5 text-white ">
        Referral System - SignUp
      </h1>
      <input
        value={form["name"]}
        type="text"
        name="name"
        className={inputStyle+`${red=="name" || red == "all"?"border-red-500":""}`}
        placeholder="Name"
        onChange={changeForm}
        required
      />
      <p className={` text-red-500 m-auto mb-1 ${red=="name" || red == "all"?"border-red-500":"hidden"}`}>Enter name</p>
      <input
        value={form["email"]}
        className={inputStyle + `${red == "email" || red == "all" ? "border-red-500 block" : ""}`}
        type="email"
        name="email"
        placeholder="Email"
        onChange={changeForm}
        required
      />
      <p className={` text-red-500 m-auto mb-1 ${red=="all" || red=="email"?"border-red-500 block":"hidden"} `}>Enter valid email</p>
      <input
        value={form["password"]}
        className={
            inputStyle +
            `${
                form["re"] != form["password"] || red == "password"
                ? "border-red-500"
                : ""
            }`
        }
        type="password"
        name="password"
        placeholder="Password"
        onChange={changeForm}
        required
      />
        <p className={` text-red-500 m-auto mb-1 ${red=="all" || red=="password" ? "border-red-500 block":"hidden"} `}>Enter password</p>
      <input
        value={form["re"]}
        className={
            inputStyle +
            `${
                form["re"] != form["password"] || red == "re"
                ? "border-red-500"
                : ""
            }`
        }
        type="password"
        name="re"
        placeholder="Re-type Password"
        onChange={changeForm}
        required
      />
        <p className={` text-red-500 m-auto mb-1 ${red=="all" || red=="re" ? "border-red-500 block":"hidden"} `}>Re-type password</p>
      <button
        onClick={submit}
        className=" p-1 border rounded w-[15%] m-auto mt-2 mb-4 text-white text-base cursor-pointer hover:bg-[#999999] hover:text-black "
      >
        Submit
      </button>
      <a href="/login" className=" text-white decoration-none m-auto mb-10 ">Already have an account</a>
    </div>
  );
}

export default SignUp;
