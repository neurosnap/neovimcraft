<script lang="ts">
  type Icon = 'github' | 'alert-circle' | 'git-branch' | 'star' | 'x-circle' | 'users' | 'search';
  export let icon: Icon;
</script>

<img class="icon" src="/{icon}.svg" alt={icon} />

<style>
  .icon {
    width: 24px;
    height: 24px;
    margin-right: 5px;
  }
</style>
