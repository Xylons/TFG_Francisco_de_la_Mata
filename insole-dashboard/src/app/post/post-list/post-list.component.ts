import { Component, OnInit, OnDestroy } from "@angular/core";
//Subscrition
import { Subscription } from 'rxjs';
//Inferfaz de Post
import { Post } from '../post.model';
//Servicio
import { PostsService } from '../posts.service';


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
  private postsSub: Subscription;
  constructor(public postsService: PostsService) { }
  ngOnInit() {
     this.postsService.getPost();
    // Subscribes to the observable
    // subscribe (funcion, error, funcion complete)
    this.postsSub= this.postsService.getPostUpdatedListener()
    .subscribe((posts: Post[]) => {
      this.posts=posts;
    });
  }
  ngOnDestroy(){
    this.postsSub.unsubscribe();
  }
  onDelete(postId: string){
    this.postsService.deletePost(postId);

  }
}
