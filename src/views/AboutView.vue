<script setup lang="ts">
    import { ref } from 'vue';
    //components
    import Divider from '../components/ui/Divider.vue';

    const members = ref([
        {
            name: 'Võ Minh Hiếu',
            role: 'Leader',
            img: 'https://avatars.githubusercontent.com/u/155798994?v=4'
        },
        {
            name: 'Bơ-xi',
            role: 'Member',
            img: 'https://avatars.githubusercontent.com/u/191247993?v=4'
        },
        {
            name: 'Trần Hữu Giang',
            role: 'Member',
            img: 'https://avatars.githubusercontent.com/u/172188513?v=4'
        },
    ]);

</script>

<template>
    <div class="flex justify-center items-center bg-slate-900/90 min-w-full p-12">
        <div class="min-w-1/2 shadow-md min-h-screen rounded-md bg-slate-800 p-4">
            <section class="p-2 bg-slate-700/50 border-l-5 border-orange-700">
                <h1 class="text-4xl uppercase text-gray-300 tracking-wider">RURY DOCUMENTS</h1>
                <p class="text-gray-400 italic">Kho tài liệu đa nghành</p>
            </section>
            <!-- members -->
            <Divider />
            <section class="mt-4">
                <h3 class="text-xl uppercase text-gray-300">Thành viên tham gia</h3>
                <div class="bg-slate-700/40 p-4 grid grid-cols-3 gap-2">
                    <div v-for="member in members" class="flex items-center space-x-4 bg-slate-600 rounded-l-full border-r-5 border-blue-500">
                        <img class="w-14 rounded-full" :src="member.img" alt="">
                        <div>
                            <h4 class="text-lg text-gray-300">{{ member.name }}</h4>
                            <p class="text-gray-400">{{ member.role }}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped>
</style>