"use client";

import { EyeCloseIcon, EyeIcon } from "@/icons";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Select, { Option } from "../form/Select";
import { useAuthToken } from "@/context/AuthContext";
import Checkbox from "../form/input/Checkbox";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import PanelSelectionModal from "../modal/PanelSelectionModal";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [username, setLoginUsername] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState<string>("");
  const [branchOptions, setBranchOptions] = useState<Option[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { login } = useAuthToken();

  const [ showPanelModal, setShowPanelModal ] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch("/api/branches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tokenNo: "", data: { deptName: "FA" } }),
        });
        const data = await response.json();

        console.log("Branch Api response:", data);
        if (response.ok && data.success) {
          const options = data.data.map((branch: any) => ({
            value: branch.deptId.toString(),
            label: branch.deptName,
          }));
          setBranchOptions(options);
          if (options.length > 0) {
            setBranch(options[0].value);
          }
        } else {
          setError(data.message || "Failed to load branches");
        }
      } catch {
        setError("Failed to load branches");
      }
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (usernameRef.current?.value && !username) {
        setLoginUsername(usernameRef.current.value);
      }
      if (passwordRef.current?.value && !password) {
        setPassword(passwordRef.current.value);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [username, password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username.trim() || !password.trim() || !branch) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenNo: "",
          data: {
            userName: username.trim(),
            userPass: password,
            initial: branch,
          },
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        login(data.data.tokenNo, data.data.userName, data.data.consultantCode);
        setUserRole(data.data.role || "consultant")
        setShowPanelModal(true);
        // router.push("/dashboard");
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Login failed. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your username and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Username <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. username"
                    type="text"
                    value={username}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    ref={usernameRef}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      ref={passwordRef}
                      disabled={loading}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label>
                    Branch <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    defaultValue={branch.toString()}
                    options={branchOptions}
                    onChange={(value) => setBranch(value)}
                    placeholder="Select Branch"
                  />
                </div>
                


                {error && <p className="text-sm text-error-500">{error}</p>}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isChecked}
                      onChange={setIsChecked}
                      disabled={loading}
                    />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                </div>

                <div>
                  <Button className="w-full" size="sm" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {showPanelModal && (
        <PanelSelectionModal 
          onClose={(panel) => {
            setShowPanelModal(false);
            if (panel === 'consultant') {
              router.push('/dashboard'); // replace with your route
            } else {
              router.push('/patientdocument'); // replace with your route
            }
          }}
        />
      )}
    </div>
  );
}

