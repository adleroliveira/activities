import React, { useState, DragEvent } from 'react';
import { Upload, Activity, Users, Building2, BarChart3, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useFileUpload } from './hooks/useFileUpload';

const AppLayout = () => {
  const { uploadProgress, uploadFile, resetUpload } = useFileUpload();
  const [isDragging, setIsDragging] = useState(false);
  const [processingStatus, setProcessingStatus] = useState({
    isProcessing: false,
    currentFile: null as string | null,
    progress: 0
  });

  // Dummy data for demonstration
  const stats = {
    totalActivities: 145,
    pendingSFSync: 23,
    totalCustomers: 12,
    totalStakeholders: 34
  };

  const handleFileDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.olm')) {
      alert('Please upload an .olm file');
      return;
    }

    await uploadFile(file);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const st = false;

  if (st) {
    setProcessingStatus({
      isProcessing: true,
      currentFile: 'example.ics',
      progress: 50
    });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Rest of the component remains the same */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <span className="text-xl font-bold">Activity Manager</span>

            {/* Upload Area - Always Visible */}
            <div
              className={`border-2 border-dashed p-4 rounded-lg flex items-center gap-2 bg-white transition-colors
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                ${uploadProgress.status === 'uploading' ? 'border-yellow-500 bg-yellow-50' : ''}
                ${uploadProgress.status === 'success' ? 'border-green-500 bg-green-50' : ''}
                ${uploadProgress.status === 'error' ? 'border-red-500 bg-red-50' : ''}`}
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className={`
                ${isDragging ? 'text-blue-500' : 'text-gray-400'}
                ${uploadProgress.status === 'uploading' ? 'text-yellow-500' : ''}
                ${uploadProgress.status === 'success' ? 'text-green-500' : ''}
                ${uploadProgress.status === 'error' ? 'text-red-500' : ''}`}
              />
              <span className="text-sm text-gray-500">
                {uploadProgress.status === 'idle' && 'Drop calendar export here'}
                {uploadProgress.status === 'uploading' && `Uploading ${uploadProgress.fileName}...`}
                {uploadProgress.status === 'success' && 'Upload complete!'}
                {uploadProgress.status === 'error' && 'Upload failed'}
              </span>
              {uploadProgress.status !== 'idle' && (
                <button
                  onClick={resetUpload}
                  className="ml-2 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Upload Status */}
      {uploadProgress.status !== 'idle' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <Alert className={`
            ${uploadProgress.status === 'uploading' ? 'border-yellow-500' : ''}
            ${uploadProgress.status === 'success' ? 'border-green-500' : ''}
            ${uploadProgress.status === 'error' ? 'border-red-500' : ''}`}
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex-1">
              {uploadProgress.message}
              {uploadProgress.status === 'uploading' && (
                <Progress
                  value={uploadProgress.progress}
                  className="mt-2"
                />
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Processing Status */}
      {processingStatus.isProcessing && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Processing {processingStatus.currentFile} - {processingStatus.progress}% complete
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActivities}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingSFSync} pending Salesforce sync
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stakeholders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStakeholders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analytics</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">View detailed reports</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customers/Partners List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Customers & Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Customer list will go here */}
                <p className="text-sm text-muted-foreground">No customers loaded yet</p>
              </div>
            </CardContent>
          </Card>

          {/* Activities List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Activities list will go here */}
                <p className="text-sm text-muted-foreground">No activities loaded yet</p>
              </div>
            </CardContent>
          </Card>

          {/* Stakeholders List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Stakeholders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Stakeholders list will go here */}
                <p className="text-sm text-muted-foreground">No stakeholders loaded yet</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;