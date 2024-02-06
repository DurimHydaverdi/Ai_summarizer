import { useState, useEffect, handleDelete } from 'react';

import { copy, linkIcon, loader, tick } from '../assets/assets/index'
import { useLazyGetSummaryQuery } from '../services/Article';

const Demo = () => {
    const [article, setArticle] = useState({
        url: '',
        summary: '',
    });
    const [allArticles, setAllArticles] = useState([]);
    const [copied, setCopied] = useState("");

    const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();


    useEffect(() => {
        const articlesFromLocalStorage = JSON.parse(
            localStorage.getItem('articles')
        )

        if(articlesFromLocalStorage) {
            setAllArticles(articlesFromLocalStorage)
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        try {
          const { data } = await getSummary({ articleUrl: article.url });
      
          if (data?.summary) {
            const newArticle = { ...article, summary: data.summary };
            const updatedAllArticles = [newArticle, ...allArticles];
      
            setArticle(newArticle);
            setAllArticles(updatedAllArticles);
      
            localStorage.setItem('articles', JSON.stringify(updatedAllArticles));
          }
        } catch (error) {
          console.error('Error fetching summary:', error);
      
          if (error?.status === 503) {
            // Service Unavailable
            // Handle the service unavailable case
            // For example, you can show a user-friendly message to inform the user
            // that the summarization service is currently unavailable.
            console.log('Service is currently unavailable. Please try again later.');
          } else {
            // Handle other errors as needed
            console.log('An error occurred:', error.message);
          }
        }
      };

    const handleCopy = (copyUrl) => {
        setCopied(copyUrl);
        navigator.clipboard.writeText(copyUrl);
        setTimeout(() => setCopied(false), 3000);
    }

    const handleDelete = (index) => {
        const updatedArticles = [...allArticles];
        updatedArticles.splice(index, 1);
        setAllArticles(updatedArticles);
        localStorage.setItem('articles', JSON.stringify(updatedArticles));
      };

  return (
    <section className="mt-16 w-full max-w-xl">
        {/* Search */}
        <div className="flex flex-col w-full gap-2">
            <form action="" className="relative flex justify-center items-center" onSubmit={handleSubmit}>
                <img src={linkIcon} alt="link_icon" className="absolute left-0 my-2 ml-3 w-5" />
            
            <input 
                type="url" placeholder="Enter a URL" vlaue={article.url} onChange={(e) => setArticle({ ... article, url:e.target.value })} required className="url_input peer"
            />

            <button type="submit" className="submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700">
                ↲
            </button>
            </form>

            {/* Browse URL History */}
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                {allArticles.map((item, index) => (
                    <div
                        key={`link-${index}`}
                        onClick={() => setArticle(item)}
                        className="link_card"
                        >
                        <div className="copy_btn" onClick={() =>
                        handleCopy(item.url)}>
                            <img 
                                src={copied === item.url ? tick : copy}
                                alt="copy_icon"
                                className="w-[40%] h-[40%] object-contain"
                            />
                        </div>
                        <p className="flex-1 font-satoshi text-blue-700 font-medium text-sm truncate">
                            {item.url}
                        </p>
                        <div className="delete_icon" onClick={() => handleDelete(index)}>
                        🗑️
              </div>
                    </div>
                ))}
            </div>
        </div>

        {/*  Display Results */}
        <div className="my-10 max-w-full flex justify-center items-center">
            {isFetching ? (
                <img src={loader} alt="loader" className="w-20 h-20 object-contain"/>
            ) : error ? (
                <p className="font-inter font-bold text-black text-center">
                    Well, that wasn't supposed to happen...
                    <br />
                    <span className="font-satoshi font-normal text-gray-700">
                        {error?.data?.error}
                    </span>
                </p>
            ) : (
                article.summary && (
                    <div className="flex flex-col gap-3">
                        <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                            Article <span className="blue_gradient"></span>
                        </h2>
                        <div className="summary_box">
                            <p className="font-inter font-medium text-sm text-gray-700">{article.summary}</p>
                        </div>
                    </div>
                )
            )}
        </div>
    </section>
  )
}

export default Demo
