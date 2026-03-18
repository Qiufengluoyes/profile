import { useState, useEffect, useCallback } from 'react';
import { BlogPost, ApiError } from '../types';

export const useBlogPosts = () => {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<ApiError | null>(null);

    const fetchBlogPosts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('https://blog.feng1026.top/rss.xml');
            if (!response.ok) {
                throw new Error(`RSS request failed: ${response.status}`);
            }

            const xmlText = await response.text();
            const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
            const items = Array.from(xmlDoc.querySelectorAll('item'));

            const stripHtml = (html: string) => {
                const doc = new DOMParser().parseFromString(html, 'text/html');
                return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
            };

            const formatDate = (dateString: string) => {
                const date = new Date(dateString);
                if (Number.isNaN(date.getTime())) return '';
                const yy = String(date.getFullYear()).slice(-2);
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                return `${yy}/${mm}/${dd}`;
            };

            const formattedBlogData: BlogPost[] = items.map((item, index) => {
                const title = item.querySelector('title')?.textContent?.trim() || '';
                const link = item.querySelector('link')?.textContent?.trim() || '';
                const descriptionRaw = item.querySelector('description')?.textContent || '';
                const pubDateRaw = item.querySelector('pubDate')?.textContent || '';

                return {
                    id: link || `post-${index}`,
                    title: title || 'Untitled',
                    link,
                    description: stripHtml(descriptionRaw),
                    pubDate: formatDate(pubDateRaw)
                };
            }).filter(post => post.title || post.link);

            setBlogPosts(formattedBlogData.slice(0, 12));
            setApiError(null);
        } catch (error) {
            console.error('加载博客RSS失败:', error);
            setBlogPosts([]);
            setApiError({ code: 500, message: '加载失败' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBlogPosts();
    }, [fetchBlogPosts]);

    return { blogPosts, loading, apiError, refetch: fetchBlogPosts };
};