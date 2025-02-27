import React, { useState, useEffect } from "react";

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [link, setLink] = useState("");
  const [number, setNumber] = useState(1);
  const [discount, setDis] = useState(0.0)
  useEffect(() => {
    let fetchUsers = async () => {
      let response = await fetch(
        `${import.meta.env.VITE_API_URL}/fetch-referred`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({ token: JSON.parse(localStorage.getItem("user"))['token'] }),
        }
      );
      if (response.ok) {
        let json = await response.json();
        setUsers(json.referred);
      }
    };
    let getCounts = async()=>{
        let response = await fetch(`${import.meta.env.VITE_API_URL}/fetch-score`,{
            method:"POST",
            headers:{
                "Content-type":"application/json"
            },
            body:JSON.stringify({
                token:JSON.parse(localStorage.getItem("user"))['token']
            })
        })
        if(response.ok){
            let json = await response.json()
            alert(json.score)
            setDis(json.score)
        }
    }
    fetchUsers();
    getCounts()
  }, []);

  let generateLink = async () => {
    let response = await fetch(
      `${import.meta.env.VITE_API_URL}/create-referral`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ target: number, token:localStorage.getItem("token") }),
      }
    );
    if (response.ok) {
      let json = await response.json();
        setLink(`${window.location}signup?referral=${json.code}`);
    }
  };

  return (
    <div className=" flex flex-col w-[45%] m-auto ">
      <h1 className=" text-5xl mb-5 mt-10 text-white m-auto ">
        Referral System
      </h1>
        <h1 className=" text-3xl mb-5 mt-10 text-white m-auto "> Total Discount: ${discount*0.5}</h1>
      <div className="info mb-5">
        <input
        readOnly
          type="text"
          name="link"
          value={link}
          placeholder="Click on generate link.."
          className=" rounded p-2 w-[90%] text-white outline-none border-white border "
          onClick={() => {
            if (link) {
              navigator.clipboard.writeText(link).then(() => {
                alert("Link copied!");
              });
            }
          }}
        />
        <input
          type="text"
          name="target"
          min={0}
          inputMode="numeric"
          className=" no-spinner rounded p-2 outline-none w-[10%] text-white border-white border "
          placeholder="Target peoples"
          value={number}
          onChange={(e)=>{
            setNumber(e.target.value)
          }}
        />
      </div>
      <button
        onClick={generateLink}
        className=" border hover:bg-[#999999] hover:text-black cursor-pointer rounded border-white text-white outline-none "
      >
        Refer friend!
      </button>

      <h1 className=" text-white mt-20 mb-5 m-auto text-5xl ">Referred Friends</h1>
      <table border={1} className=" border-white border text-center">
        <tr>
          <th>Name</th>
          <th>Email</th>
        </tr>
      {Object.keys(users).map((e)=>{
        return (
            <>
                <td key={users[e].name}>
                    <p key={users[e].name} className=" text-white m-auto ">{users[e].name}</p>
                </td>
                <td key={users[e].name}>
                    <p className="text-white m-auto">{users[e].email}</p>
                </td>
                </>
        )
        })}
</table>
    </div>
  );
}

export default Dashboard;
