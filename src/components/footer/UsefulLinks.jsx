import React, { useEffect, useState } from "react";
import useApi from "../../hooks/useApi";
import { policyPageAPI } from "../../api";
import { Link } from "react-router";

const UsefulLinks = () => {
  const { callApi, error } = useApi();
  const [policyPages, setPolicyPages] = useState([]);

  useEffect(() => {
    const fetchPolicyPages = async () => {
      const res = await callApi(policyPageAPI.getPolicyPagesList());
      if (res?.success && res?.data) {
        setPolicyPages(res.data);
      }
    };
    fetchPolicyPages();
  }, []);

  if (error || !policyPages.length) return null;

  return (
    <ul className="mt-3 space-y-2 text-sm">
      {policyPages.map(({ _id, title }) => (
        <li key={_id}>
          <Link
            to={`/${title}/${_id}`}
            className="text-ink no-underline hover:italic"
          >
            {title}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default UsefulLinks;
