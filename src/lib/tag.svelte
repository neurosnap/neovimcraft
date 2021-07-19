<script lang="ts">
  import type { Tag } from './types';

  function findColor(tag: Tag) {
    if (tag.count === 1) return 'pink';
    if (tag.count > 1 && tag.count <= 3) return 'yellow';
    if (tag.count > 3 && tag.count <= 10) return 'orange';
    if (tag.count > 10 && tag.count <= 15) return 'green';
    return 'purple';
  }

  export let tag: Tag;
  export let onSearch: (t: string) => any = (_: string) => {};
  export let showCount: boolean = true;
</script>

<span class="tag {findColor(tag)}" on:click={() => onSearch(`tag:${tag.id}`)}>
  {tag.id}{#if showCount} x {tag.count}{/if}
</span>

<style>
  .tag {
    padding: 5px;
    margin: 5px 5px 5px 0;
    border: 1px solid black;
    white-space: pre-wrap;
    word-break: break-word;
    display: inline-block;
    cursor: pointer;
    color: var(--primary-color);
    font-size: 0.8rem;
  }

  .tag:hover {
    background-color: var(--highlight-color);
  }
</style>
