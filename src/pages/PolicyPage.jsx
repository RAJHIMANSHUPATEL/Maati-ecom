import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import useApi from "../hooks/useApi";
import { policyPageAPI } from "../api";
import LoadingSpinner from "../components/LoadingSpinner";

const PolicyPage = () => {
  const  {_id}  = useParams();
  console.log(_id)
  const { callApi, loading, error } = useApi();
  const [policyPage, setPolicyPage] = useState(null);

  useEffect(() => {
    const fetchPolicyPage = async () => {
      if (!_id) return;
      const res = await callApi(policyPageAPI.getPolicyPageById({ _id }));
      if (res?.success && res?.data) {
        setPolicyPage(res.data);
      }
    };
    fetchPolicyPage();
  }, [_id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600 text-center">{error}</div>;
  if (!policyPage) return <div className="text-center">No policy page found</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary">
          {policyPage.title}
        </h1>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: policyPage.content }}
        />
      </div>
    </div>
  );
};

export default PolicyPage;
