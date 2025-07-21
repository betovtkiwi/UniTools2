"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  Wrench,
  Newspaper,
  Star,
  Save,
  X
} from "lucide-react"

interface Tool {
  id: string
  title?: string
  description?: string
  image?: string
  isActive: boolean
  createdAt: string
}

interface News {
  id: string
  title: string
  content: string
  image?: string
  isHighlight: boolean
  createdAt: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"tools" | "news">("tools")
  const [tools, setTools] = useState<Tool[]>([])
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [showToolModal, setShowToolModal] = useState(false)
  const [showNewsModal, setShowNewsModal] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  
  // Form states
  const [toolForm, setToolForm] = useState({
    title: "",
    description: "",
    image: ""
  })
  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    image: "",
    isHighlight: false
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [toolsRes, newsRes] = await Promise.all([
        fetch("/api/tools"),
        fetch("/api/news")
      ])

      if (toolsRes.ok) {
        const toolsData = await toolsRes.json()
        setTools(toolsData)
      }

      if (newsRes.ok) {
        const newsData = await newsRes.json()
        setNews(newsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File, type: string) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        return data.url
      }
    } catch (error) {
      console.error("Upload error:", error)
    }
    return null
  }

  const saveTool = async () => {
    try {
      const url = editingTool ? `/api/tools/${editingTool.id}` : "/api/tools"
      const method = editingTool ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(toolForm)
      })

      if (response.ok) {
        fetchData()
        setShowToolModal(false)
        setEditingTool(null)
        setToolForm({ title: "", description: "", image: "" })
      }
    } catch (error) {
      console.error("Error saving tool:", error)
    }
  }

  const saveNews = async () => {
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newsForm)
      })

      if (response.ok) {
        fetchData()
        setShowNewsModal(false)
        setNewsForm({ title: "", content: "", image: "", isHighlight: false })
      }
    } catch (error) {
      console.error("Error saving news:", error)
    }
  }

  const deleteTool = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta ferramenta?")) return

    try {
      const response = await fetch(`/api/tools/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Error deleting tool:", error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="mt-2 text-gray-600">Gerencie ferramentas e novidades</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("tools")}
              className={`${
                activeTab === "tools"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Wrench className="h-5 w-5 mr-2" />
              Ferramentas
            </button>
            <button
              onClick={() => setActiveTab("news")}
              className={`${
                activeTab === "news"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Newspaper className="h-5 w-5 mr-2" />
              Novidades
            </button>
          </nav>
        </div>

        {/* Tools Tab */}
        {activeTab === "tools" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Ferramentas ({tools.length})
              </h2>
              <button
                onClick={() => setShowToolModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Ferramenta
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tools.map((tool) => (
                <div key={tool.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="h-32 bg-gray-100 flex items-center justify-center">
                    {tool.image ? (
                      <img src={tool.image} alt={tool.title} className="w-full h-full object-cover" />
                    ) : (
                      <Wrench className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {tool.title || "Sem título"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {tool.description || "Sem descrição"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tool.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {tool.isActive ? "Ativo" : "Inativo"}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingTool(tool)
                            setToolForm({
                              title: tool.title || "",
                              description: tool.description || "",
                              image: tool.image || ""
                            })
                            setShowToolModal(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteTool(tool.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* News Tab */}
        {activeTab === "news" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Novidades ({news.length})
              </h2>
              <button
                onClick={() => setShowNewsModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Novidade
              </button>
            </div>

            <div className="space-y-4">
              {news.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                        {item.isHighlight && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Destaque
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2 line-clamp-2">{item.content}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    {item.image && (
                      <div className="ml-4 flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tool Modal */}
        {showToolModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingTool ? "Editar Ferramenta" : "Nova Ferramenta"}
                    </h3>
                    <button
                      onClick={() => {
                        setShowToolModal(false)
                        setEditingTool(null)
                        setToolForm({ title: "", description: "", image: "" })
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título (opcional)
                      </label>
                      <input
                        type="text"
                        value={toolForm.title}
                        onChange={(e) => setToolForm({ ...toolForm, title: e.target.value })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição (opcional)
                      </label>
                      <textarea
                        rows={3}
                        value={toolForm.description}
                        onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imagem (opcional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const url = await handleImageUpload(file, "tools")
                            if (url) {
                              setToolForm({ ...toolForm, image: url })
                            }
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      {toolForm.image && (
                        <img src={toolForm.image} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={saveTool}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* News Modal */}
        {showNewsModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Nova Novidade</h3>
                    <button
                      onClick={() => {
                        setShowNewsModal(false)
                        setNewsForm({ title: "", content: "", image: "", isHighlight: false })
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título *
                      </label>
                      <input
                        type="text"
                        value={newsForm.title}
                        onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Conteúdo *
                      </label>
                      <textarea
                        rows={4}
                        value={newsForm.content}
                        onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imagem (opcional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const url = await handleImageUpload(file, "news")
                            if (url) {
                              setNewsForm({ ...newsForm, image: url })
                            }
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      {newsForm.image && (
                        <img src={newsForm.image} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded" />
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="highlight"
                        checked={newsForm.isHighlight}
                        onChange={(e) => setNewsForm({ ...newsForm, isHighlight: e.target.checked })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="highlight" className="ml-2 block text-sm text-gray-900">
                        Marcar como destaque
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={saveNews}
                    disabled={!newsForm.title || !newsForm.content}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}