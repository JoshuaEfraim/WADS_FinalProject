import { useState, useEffect } from "react"
import { Search, Settings, Menu, LayoutDashboard, Ticket, Users, Bell, X, LogOut } from "lucide-react"
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import authService from "@/services/auth"
import { useToast } from "@/components/ui/use-toast"

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [adminProfile, setAdminProfile] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await authService.getCurrentUser()
        // Extract profile from response
        if (response.success && response.profile) {
          setAdminProfile(response.profile)
        } else {
          console.error('Invalid profile data structure:', response)
        }
      } catch (error) {
        console.error('Error fetching admin profile:', error)
      }
    }

    fetchAdminProfile()
  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate('/login')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to logout"
      })
    }
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Ticket, label: "Tickets", href: "/admin/tickets" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: Settings, label: "Settings", href: "/admin/profile" },
    { icon: LogOut, label: "Logout", onClick: handleLogout },
  ]

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'AD'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`
          z-50 bg-card border-r transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "w-64" : "w-20"}
          hidden lg:flex flex-col
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-24 w-full">
          <img src="/logo/siloamLogo-rectangle.png" alt="Logo" className="h-40 w-40 object-contain" />
        </div>

        {/* User Profile - Vertical layout */}
        <div className="px-4 pb-4">
          <div className="flex flex-col items-center">
            <Avatar className="h-12 w-12 mb-2">
              <AvatarImage src={adminProfile?.profileImg} alt="User" />
              <AvatarFallback>{getInitials(adminProfile?.name)}</AvatarFallback>
            </Avatar>
            {isSidebarOpen && (
              <div className="text-center">
                <h3 className="font-medium text-sm">{adminProfile?.name || 'Loading...'}</h3>
                <p className="text-xs text-muted-foreground">{adminProfile?.email || 'Loading...'}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            item.onClick ? (
              <button
                key={item.label}
                onClick={item.onClick}
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-primary-500 hover:text-white"
              >
                <item.icon className="h-5 w-5 mr-3 transition-transform duration-300" />
                {isSidebarOpen && (
                  <span className="transition-opacity duration-300 opacity-90">
                    {item.label}
                  </span>
                )}
              </button>
            ) : (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
                  isActive(item.href)
                    ? "bg-primary-500 text-white shadow-md"
                    : "hover:bg-primary-500 hover:text-white"
                }`}
              >
                <item.icon className={`h-5 w-5 mr-3 transition-transform duration-300 ${isActive(item.href) ? "text-white scale-110" : ""}`} />
                {isSidebarOpen && (
                  <span className={`transition-opacity duration-300 ${isActive(item.href) ? "opacity-100" : "opacity-90"}`}>
                    {item.label}
                  </span>
                )}
              </Link>
            )
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-lg lg:hidden flex flex-col">
          {/* Mobile Sidebar Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <img src="/logo/siloamLogo-rectangle.png" alt="Logo" className="h-10 w-10 object-contain mr-2" />
              <span className="font-bold text-secondary-500 text-2xl">My</span> <span className="font-bold text-primary-500 text-2xl">Siloam</span>
            </div>
            <Button variant="ghost" size="icon" className= "hover:bg-primary-500 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <Separator />

          {/* User Profile */}
          <div className="px-4 py-4">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={adminProfile?.profileImg} alt="User" />
                <AvatarFallback>{getInitials(adminProfile?.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-sm">{adminProfile?.name || 'Loading...'}</h3>
                <p className="text-xs text-muted-foreground">{adminProfile?.email || 'Loading...'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Mobile Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
                  isActive(item.href)
                    ? "bg-primary-500 text-white shadow-md"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className={`h-5 w-5 mr-3 transition-transform duration-300 ${isActive(item.href) ? "text-white scale-110" : ""}`} />
                <span className={`transition-opacity duration-300 ${isActive(item.href) ? "opacity-100" : "opacity-90"}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="w-full border-b bg-card">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            {/* Left side - Search and Menu */}
            <div className="flex items-center space-x-4">
              {/* Desktop Sidebar Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex hover:bg-primary-500 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
              {/* Mobile Menu Button */}
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden hover:bg-primary-500 hover:text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {/* Right side - Notifications, Settings and Avatar */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className=" sm:flex hover:bg-primary-500 hover:text-white">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="sm:flex hover:bg-primary-500 hover:text-white">
                <Settings className="h-5 w-5" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={adminProfile?.profileImg} alt="User" />
                <AvatarFallback>{getInitials(adminProfile?.name)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="bg-accent flex-1 p-4 lg:p-6 overflow-auto min-w-0"><Outlet/></main>
      </div>
    </div>
  )
}

export default AdminLayout
