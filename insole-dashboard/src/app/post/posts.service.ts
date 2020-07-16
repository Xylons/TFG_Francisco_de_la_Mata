import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router, ParamMap, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Post } from './post.model';

// Uso variables de entorno para obtener la direccion API
import{ environment } from '../../environments/environment';

//Observable
import { Subject, Subscription } from 'rxjs';
// Map se usa para transformar arrays en otros nuevos
import { map } from 'rxjs/operators'
import { DashboardService } from '../dashboard/dashboard.service';

const BACKEND_URL = environment.apiURL + "/posts/"

//This adds the service in the provide list at app.module.ts
@Injectable({ providedIn: 'root' })

export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts:Post[], postCount: number}>();
  userIdListener:Subscription;
  //Objeto para suscribir el post component con el id que recibe de dashboard
  recieveduserIdListener=new Subject<string>();

  private patientId:string;

  constructor(private http: HttpClient, private router: Router, ) {


  }
  setPatientId(patientId:string){
    console.log(patientId);
    this.patientId=(patientId);
  }

  getRecUserIdListener(){
    return this.recieveduserIdListener.asObservable();
  }
  getPosts(postPerPage: number, currentPage: number) {
    /// `` sirve añadir valores a un string dinamicamente
    const queryParams= `?pagesize=${postPerPage}&page=${currentPage}&userId=${this.patientId}`
    // En este no hace falta unscribe ya que se desuscribe solo
    this.http.get<{ message: string, posts: any , maxPosts: number}>(BACKEND_URL+ queryParams)
      .pipe(map((postData) => {
        return {posts: postData.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id,
            tiemstamp: post.timestamp,
            creator: post.creator
          };
        }), maxPosts: postData.maxPosts};

      }))
      .subscribe((transformedPostData) => {
        console.log(transformedPostData);
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({posts:[...this.posts], postCount: transformedPostData.maxPosts});
      });
  }
  getPostUpdatedListener() {
    return this.postsUpdated.asObservable();
  }
  getPost(id: string){
    return this.http.get<{
      _id: string,
      title: string,
      content: string,
      timestamp:number,
      creator:string
    }>(BACKEND_URL + id);

  }
  addPost(title: string, content: string) {
    console.log(title+content);
    let postData=  {
      title:title,
      content: content,
      userId: this.patientId
    }
    this.http.post<{ message: string, post: Post }>(BACKEND_URL, postData)
      .subscribe((responseData) => {
        //this.router.navigate(["/"]);
        this.getPosts(4,1);
      });

  }

  updatePost(id: string, title: string, content: string){
    let postData: Post ;
    // Si el objeto es un archivo significa que se ha cambiado

      postData=  {
        id:id,
        title:title,
        content: content,
        creator: null
      }



    this.http.put(BACKEND_URL + id, postData)
    .subscribe(response =>{
      this.router.navigate(["/"]);
    });
  }
  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
  }

}
