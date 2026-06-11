"use client";
import port from "@/api/api";
import React, { useState } from "react";

function Create() {
  const [formData, setFormData] = useState({
    content: "",
    media_urL: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement| HTMLFormElement>) => {
        e.preventDefault();
        try{
            const response = await fetch(`${port}/api/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include',
            }) ;

            const data = await response.json();

            if(data.success) {
                console.log(data);
                console.log("post successfuly");
            }
        } catch(_err) {
            console.error("Error submit form", _err);
        }
  }

  return (
    <div className="w-full flex justify-center items-center p-40">
      <form onSubmit={handleSubmit} className="w-full flex flex-col border border-black">
        <textarea
          name="content"
          placeholder="Enter your caption"
          onChange={handleChange}
          className="bg-gray-200"
        />
        <input type="file" name="media_url" onChange={handleChange} />
        <button type="submit" className="bg-amber-400">Dang</button>
      </form>
    </div>
  );
}

export default Create;
