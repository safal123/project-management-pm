<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory, HasUlids;

    public $fillable = [
        'filename',
        'original_filename',
        'mime_type',
        'path',
        'filesize',
        'filetype',
        'disk',
        'created_by',
        'workspace_id',
        'mediable_id',
        'mediable_type',
    ];

    public function mediable()
    {
        return $this->morphTo();
    }

    // Append the url attribute to the model
    protected $appends = ['url'];

    public function getUrlAttribute()
    {
        if ($this->disk === 's3') {
            return Storage::disk($this->disk)
                ->temporaryUrl(
                    $this->path,
                    now()->addMinutes(10)
                );
        }

        return Storage::url($this->path);
    }
}
