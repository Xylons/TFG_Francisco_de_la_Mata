import { Component, OnInit, OnDestroy } from "@angular/core";
//Subscrition
import { Subscription } from 'rxjs';
//Inferfaz de Post
import { Post } from '../post.model';
//Servicio
import { PostsService } from '../posts.service';
import { PageEvent } from '@angular/material/paginator';


@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

  /* posts = [
    { title: ' hola', content: "adfasfsfasf" },
    { title: ' aasdasda', content: "awqwwsf" },
    { title: ' aaaaaaa', content: "adfqqqqqq" }

  ] */
  posts: Post[] = [];
  isLoading=false;
  //controladores de paginator
  totalPost= 0;
  postPerPage=2;
  currentPage=1;
  pageSizeOptions=[1,2,5,10];

  private postsSub: Subscription;
  constructor(public postsService: PostsService) { }
  ngOnInit() {
    this.isLoading=true;
     this.postsService.getPosts(this.postPerPage, this.currentPage);
    // Subscribes to the observable
    // subscribe (funcion, error, funcion complete)
    this.postsSub= this.postsService.getPostUpdatedListener()
    .subscribe((postData: {posts: Post[], postCount: number}) => {
      this.isLoading=false;
      this.posts=postData.posts;
      this.totalPost= postData.postCount;
    });
  }

  onChangePage(pageData: PageEvent){
    this.isLoading=true;
    this.currentPage= pageData.pageIndex +1;
    this.postPerPage=pageData.pageSize;
    this.postsService.getPosts(this.postPerPage, this.currentPage);
  }

  ngOnDestroy(){
    this.postsSub.unsubscribe();
  }
  onDelete(postId: string){
    this.isLoading=true;
    // Cada vez que se elimina se actualiza
    this.postsService.deletePost(postId).subscribe(()=>{
      this.postsService.getPosts(this.postPerPage, this.currentPage);
    });

  }
}
