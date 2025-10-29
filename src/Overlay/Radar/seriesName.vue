<template>
    <div class="series-name-wrap">
        <div class="item">{{ settings?.seriesName_first }}</div>
        <div class="item">{{ settings?.seriesName_second }}</div>
    </div>
</template>

<style scoped lang="scss">
.series-name-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 35px;
    border-radius: var(--border-radius);
    padding: 0 10px;
    background: var(--primary-80);

    .item {
        font-size: 0.9rem;
        font-weight: 600;
        z-index: 2;
        color: white;
    }
}
</style>

<script setup lang="ts">
defineProps(['settings'])
</script>
