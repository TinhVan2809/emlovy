function SidebarRight() {
    return ( 
        <div className="flex h-screen fixed z-1000 top-0 py-6">
            <div className="w-full">
                <input type="text" placeholder="Search for" className="px-3 py-1 border border-black/25 rounded-2xl w-full"/>
            </div>
        </div>
     );
}

export default SidebarRight;