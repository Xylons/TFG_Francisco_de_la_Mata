import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router';
import { Post } from './post.model';


//Observable
import { Subject } from 'rxjs';
// Map se usa para transformar arrays en otros nuevos
import { map } from 'rxjs/operators'

//This adds the service in the provide list at app.module.ts
@Injectable({ providedIn: 'root' })

export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts:Post[], postCount: number}>();


  constructor(private http: HttpClient, private router: Router) { }
  getPosts(postPerPage: number, currentPage: number) {
    /// `` sirve añadir valores a un string dinamicamente
    const queryParams= `?pagesize=${postPerPage}&page=${currentPage}`
    // En este no hace falta unscribe ya que se desuscribe solo
    this.http.get<{ message: string, posts: any , maxPosts: number}>('http://localhost:3000/api/posts'+ queryParams)
      .pipe(map((postData) => {
        return {posts: postData.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id,
            imagePath: post.imagePath
          };
        }), maxPosts: postData.maxPosts};

      }))
      .subscribe((transformedPostData) => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({posts:[...this.posts], postCount: transformedPostData.maxPosts});
      });
  }
  getPostUpdatedListener() {
    return this.postsUpdated.asObservable();
  }
  getPost(id: string){
    return this.http.get<{_id: string, title: string, content: string, imagePath: string}>('http://localhost:3000/api/posts/' + id);

  }
  addPost(title: string, content: string, image:File) {
    const postData= new FormData();
    postData.append("title", title),
    postData.append("content", content),
    // se llama image ya que accedemos desde back con single("image")
    postData.append("image", image, title);
    this.http.post<{ message: string, post: Post }>('http://localhost:3000/api/posts', postData)
      .subscribe((responseData) => {
        this.router.navigate(["/"]);
      });

  }

  updatePost(id: string, title: string, content: string, image: File | string){
    let postData: Post | FormData;
    // Si el objeto es un archivo significa que se ha cambiado
    if(typeof(image)=== 'object'){
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);

    }else{
      postData=  {
        id:id,
        title:title,
        content: content,
        imagePath: image
      }

    }

    this.http.put('http://localhost:3000/api/posts/' + id, postData)
    .subscribe(response =>{
      this.router.navigate(["/"]);
    });
  }
  deletePost(postId: string) {
    return this.http.delete('http://localhost:3000/api/posts/' + postId);
  }

}
