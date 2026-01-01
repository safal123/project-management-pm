<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function uploadMedia(Request $request)
    {
        $request->validate([
            'path' => 'required|string',
            'filename' => 'required|string',
            'original_filename' => 'required|string',
            'filetype' => 'required|string',
            'filesize' => 'required|integer',
            'workspace_id' => 'required|string',
            'mediable_id' => 'required|string',
            'mediable_type' => 'required|string',
        ]);

        if (! Storage::disk('s3')->exists($request->path)) {
            return response()->json([
                'message' => 'Path not found',
            ], 404);
        }

        // Map mediable_type to actual model class
        $mediableTypeMap = [
            'task' => \App\Models\Task::class,
            'user' => \App\Models\User::class,
            'project' => \App\Models\Project::class,
            'workspace' => \App\Models\Workspace::class,
        ];

        $mediableClass = $mediableTypeMap[$request->mediable_type] ?? null;

        if (! $mediableClass) {
            return response()->json([
                'message' => 'Invalid mediable type',
            ], 400);
        }

        $mediable = $mediableClass::findOrFail($request->mediable_id);

        // For users, delete old profile picture first
        if ($request->mediable_type === 'user') {
            $oldMedia = $mediable->media()->get();
            foreach ($oldMedia as $old) {
                try {
                    Storage::disk($old->disk ?? 's3')->delete($old->path);
                } catch (\Exception $e) {
                    Log::error('Failed to delete old media: '.$e->getMessage());
                }
                $old->delete();
            }
        }

        $mediable->media()->create([
            'filename' => $request->filename,
            'original_filename' => $request->original_filename,
            'filetype' => $request->filetype,
            'filesize' => $request->filesize,
            'path' => $request->path,
            'workspace_id' => $request->workspace_id,
            'created_by' => auth()->user()->id,
            'disk' => 's3',
        ]);

        return redirect()->back()->with('success', 'Media uploaded successfully');
    }

    public function getMedia(Request $request, Media $media)
    {

        $media->load('mediable');

        return response()->json([
            'media' => $media,
        ]);
    }

    public function deleteMedia(Request $request, Media $media)
    {
        // Store the path before deletion
        $path = $media->path;
        $disk = $media->disk ?? 's3';

        // Delete from storage first, then from database
        try {
            Storage::disk($disk)->delete($path);
        } catch (\Exception $e) {
            // Log the error but continue with database deletion
            Log::error('Failed to delete media from storage: '.$e->getMessage());
        }

        // Delete from database
        $media->delete();

        return redirect()->back()->with('success', 'Media deleted successfully');
    }
}
