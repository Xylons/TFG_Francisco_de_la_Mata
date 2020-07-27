import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router, ParamMap, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Comment } from './comment.model';

// Uso variables de entorno para obtener la direccion API
import{ environment } from '../../environments/environment';

//Observable
import { Subject, Subscription } from 'rxjs';
// Map se usa para transformar arrays en otros nuevos
import { map } from 'rxjs/operators'
import { DashboardService } from '../dashboard/dashboard.service';

const BACKEND_URL = environment.apiURL + "/comments/"

//This adds the service in the provide list at app.module.ts
@Injectable({ providedIn: 'root' })

export class CommentsService {
  private comments: Comment[] = [];
  private commentsUpdated = new Subject<{comments:Comment[], commentCount: number}>();
  userIdListener:Subscription;
  //Objeto para suscribir el comment component con el id que recibe de dashboard
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
  getComments(commentPerPage: number, currentPage: number) {
    /// `` sirve añadir valores a un string dinamicamente
    const queryParams= `?pagesize=${commentPerPage}&page=${currentPage}&userId=${this.patientId}`
    // En este no hace falta unscribe ya que se desuscribe solo
    this.http.get<{ message: string, comments: any , maxComments: number}>(BACKEND_URL+ queryParams)
      .pipe(map((commentData) => {
        return {comments: commentData.comments.map(comment => {
          return {
            title: comment.title,
            content: comment.content,
            id: comment._id,
            tiemstamp: comment.timestamp,
            creator: comment.creator
          };
        }), maxComments: commentData.maxComments};

      }))
      .subscribe((transformedCommentData) => {
        console.log(transformedCommentData);
        this.comments = transformedCommentData.comments;
        this.commentsUpdated.next({comments:[...this.comments], commentCount: transformedCommentData.maxComments});
      });
  }
  getCommentUpdatedListener() {
    return this.commentsUpdated.asObservable();
  }
  getComment(id: string){
    return this.http.get<{
      _id: string,
      title: string,
      content: string,
      timestamp:number,
      creator:string
    }>(BACKEND_URL + id);

  }
  addComment(title: string, content: string) {
    console.log(title+content);
    let commentData=  {
      title:title,
      content: content,
      userId: this.patientId
    }
    this.http.post<{ message: string, comment: Comment }>(BACKEND_URL, commentData)
      .subscribe((responseData) => {
        //this.router.navigate(["/"]);
        this.getComments(4,1);
      });

  }

  updateComment(id: string, title: string, content: string){
    let commentData: Comment ;
    // Si el objeto es un archivo significa que se ha cambiado

    commentData=  {
        id:id,
        title:title,
        content: content,
        creator: null
      }



    this.http.put(BACKEND_URL + id, commentData)
    .subscribe(response =>{
      this.router.navigate(["/"]);
    });
  }
  deleteComment(commentId: string) {
    return this.http.delete(BACKEND_URL + commentId);
  }

}
