'use client'

import { getCookie } from "cookies-next"
import { Profile } from "./profile"
import { useEffect, useState } from "react";

export default function NavBar() {
    // const [user, setUser] = useState("");
    // const cookie = getCookie("auth")
    // const auth = cookie?.toString() ?? '';

    // useEffect(() => {
    //     getUser(UserId, auth).then(setUser);
    // }, [userId, auth]);


return (
        <div className="bg-white shadow-md flex flex-row mt-0 min-w-full h-[84px]">
            <Profile userId={""} userName={""} />
        </div>
    )
}