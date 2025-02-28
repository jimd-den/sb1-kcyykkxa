<script lang="ts">
  import type { Comment } from '../../core/entities/Session';
  
  export let comments: Comment[] = [];
  
  function formatTimestamp(timestamp: Date): string {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="comment-list">
  <h3>Comments</h3>
  {#if comments.length === 0}
    <p class="no-comments">No comments yet</p>
  {:else}
    <ul>
      {#each comments as comment}
        <li class="comment-item">
          <div class="comment-time">{formatTimestamp(comment.timestamp)}</div>
          <div class="comment-text">{comment.text}</div>
          {#if comment.pictureData}
            <div class="comment-image">
              <img src={comment.pictureData} alt="Comment attachment" />
            </div>
          {/if}
        </li>
      {/each}
      
    </ul>
  {/if}
  
</div>

<style>
  .comment-list {
    margin-top: 1rem;
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.5rem;
  }
  
  h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
  }
  
  .no-comments {
    color: #888;
    font-style: italic;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .comment-item {
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
  }
  
  .comment-item:last-child {
    border-bottom: none;
  }
  
  .comment-time {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.2rem;
  }
  
  .comment-text {
    word-break: break-word;
    margin-bottom: 0.5rem;
  }
  
  .comment-image img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 4px;
    margin-top: 0.5rem;
  }
</style>