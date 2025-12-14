<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class S3UploadController extends Controller
{
    /*
    * Generate a presigned URL for a file in S3
    * @param string $filename
    * @return string
    */
    public function generateSignedUrl(Request $request)
    {
        $request->validate([
            'filename' => 'required|string|max:255',
            'file_type' => 'required|string|in:image,image/jpeg,image/png,image/gif,video,audio,document',
            'file_size' => 'required|integer|min:1|max:5242880', // 5MB max
        ]);

        $filename = Str::random(40) . '_' . $request->filename;
        $path = 'uploads/' . date('Y/m/d') . '/' . $filename;
        $client = Storage::disk('s3')->getClient();
        $command = $client->getCommand('PutObject', [
            'Bucket' => config('filesystems.disks.s3.bucket'),
            'Key' => $path,
            'ContentType' => $request->file_type,
            'ContentLength' => $request->file_size,
        ]);
        $presignedUrl = $client->createPresignedRequest($command, '+5 minutes')->getUri();
        return response()->json([
            'signed_url' => $presignedUrl,
            'filename' => $filename,
            'path' => $path,
            'original_filename' => $request->filename,
        ]);
    }
}
