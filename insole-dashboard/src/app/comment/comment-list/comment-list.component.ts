import { Component, OnInit, OnDestroy } from "@angular/core";
//Subscrition
import { Subscription } from 'rxjs';
//Inferfaz de Comment
import { Comment } from '../comment.model';
//Servicio
import { CommentsService } from '../comments.service';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css']
})
export class CommentListComponent implements OnInit, OnDestroy {


  comments: Comment[] = [];
  isLoading = false;
  //controladores de paginator
  totalComment = 0;
  commentPerPage = 4;
  currentPage = 1;
  pageSizeOptions = [1, 2, 4];
  userIsAuthenticated = false;
  userId: string;
  rol: string;
  patientIdListener:Subscription;
  private commentsSub: Subscription;
  //Aqui se usara para que solo pueda crear un gestor
  private authStatusSub: Subscription;
  constructor(public commentsService: CommentsService, private authService: AuthService) { }
  ngOnInit() {


      this.commentsService.getComments(this.commentPerPage, this.currentPage);


    //this.isLoading = true;
    this.rol= this.authService.getRolLogged();
    this.userId= this.authService.getUserId();
    // Subscribes to the observable
    // subscribe (funcion, error, funcion complete)
    this.commentsSub = this.commentsService.getCommentUpdatedListener()
      .subscribe((commentData: { comments: Comment[], commentCount: number }) => {
        this.isLoading = false;
        this.comments = commentData.comments;
        this.totalComment = commentData.commentCount;
      });

    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
    });
  }

  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.commentPerPage = pageData.pageSize;
    this.commentsService.getComments(this.commentPerPage, this.currentPage);
  }

  ngOnDestroy() {
    this.commentsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
  onDelete(commentId: string) {
    this.isLoading = true;
    // Cada vez que se elimina se actualiza
    this.commentsService.deleteComment(commentId).subscribe(() => {
      this.commentsService.getComments(this.commentPerPage, this.currentPage);
    },()=>{
      // si falla se quita el spinner
      this.isLoading=false;
    });

  }
}
