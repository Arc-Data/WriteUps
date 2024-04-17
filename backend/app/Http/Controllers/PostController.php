<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostDetailedResource;
use App\Http\Resources\PostResource;
use App\Models\Like;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $posts = Post::latest()->paginate(10);
        return PostResource::collection($posts);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        $validatedData = $request->validate([
            "title" => 'required|string|max:100',
            'description' => 'required|string'           
        ]);

        $validatedData['title'] = strip_tags($validatedData['title']);
        $validatedData['description'] = strip_tags($validatedData['description']);

        $post = new Post($validatedData);
        $post->user()->associate($user);
        $post->save();

        return response()->json([
            'message' => 'Post created.'
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        return new PostDetailedResource($post);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        $validatedData = $request->validate([
            "title" => 'required|string|max:100',
            'description' => 'required|string'           
        ]);

        
        $validatedData['title'] = strip_tags($validatedData['title']);
        $validatedData['description'] = strip_tags(nl2br($validatedData['description']), '<br>');
        
        $post->update($validatedData);

        return response()->json(['message' => 'Post updated.'], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        if ($post->user_id !== auth()->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $post->delete();
        return response()->json(['message' => "Post deleted."]);
    }

    public function like(Post $post) 
    {
        $user = auth()->user();

        $isLiked = $post->likes()->where('user_id', $user->id)->exists();

        if ($isLiked) {
            $post->likes()->where('user_id', $user->id)->delete();
            $message = "Post unliked";
        }
        else {
            $post->likes()->create(['user_id' => $user->id]);
            $message = "Post liked";
        }

        return response()->json(['message' => $message]);
    }
}
