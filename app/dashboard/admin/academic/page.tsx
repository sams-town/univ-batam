'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, BookOpen, Building, GraduationCap } from 'lucide-react'

export default function AdminAcademicPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Manajemen Akademik</h1>
        <p className="text-slate-500 mt-1">Kelola program studi, mata kuliah, dan ruang kelas</p>
      </div>

      <Tabs defaultValue="programs">
        <TabsList className="mb-6">
          <TabsTrigger value="programs">
            <GraduationCap className="h-4 w-4 mr-2" />
            Program Studi
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="h-4 w-4 mr-2" />
            Mata Kuliah
          </TabsTrigger>
          <TabsTrigger value="rooms">
            <Building className="h-4 w-4 mr-2" />
            Ruang Kelas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-6">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <GraduationCap className="h-5 w-5 text-blue-500" />
                    Daftar Program Studi
                  </CardTitle>
                  <CardDescription className="text-slate-500">Kelola program studi di kampus</CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Program Studi
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 text-center py-8">Fitur akan segera hadir</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <BookOpen className="h-5 w-5 text-green-500" />
                    Daftar Mata Kuliah
                  </CardTitle>
                  <CardDescription className="text-slate-500">Kelola mata kuliah yang ditawarkan</CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Mata Kuliah
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 text-center py-8">Fitur akan segera hadir</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Building className="h-5 w-5 text-purple-500" />
                    Daftar Ruang Kelas
                  </CardTitle>
                  <CardDescription className="text-slate-500">Kelola ruang kelas yang tersedia</CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Ruang Kelas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 text-center py-8">Fitur akan segera hadir</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}