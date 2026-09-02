function SidebarRight() {
    return (
        <div className="flex h-screen fixed top-0 py-6">
            <div className="flex flex-col gap-2">
                <div className="w-full">
                    <input type="text" placeholder="Search for" className="px-3 py-1 border border-black/25 rounded-2xl w-full" />
                </div>
                <div className="flex justify-between w-full flex-wrap">
                    <p className="text-sm opacity-70">&copy; Copyright emlovy - 2026</p>
                    <div className="flex gap-3">
                        <span className="text-sm opacity-70 cursor-pointer hover:underline">
                            APIs
                        </span>
                        <span className="text-sm opacity-70 cursor-pointer hover:underline">
                            Bảo mật
                        </span>
                        <span className="text-sm opacity-70 cursor-pointer hover:underline">
                            Chính sách và quyền riêng tư
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SidebarRight;